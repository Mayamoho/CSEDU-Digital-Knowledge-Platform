package projects

import (
	"encoding/json"
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"

	authpkg "github.com/csedu/platform/api/internal/auth"
)

type Handler struct {
	db *pgxpool.Pool
}

func NewHandler(db *pgxpool.Pool) *Handler {
	return &Handler{db: db}
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"message": msg})
}

type StudentProject struct {
	ProjectID    string    `json:"project_id"`
	ItemID       string    `json:"item_id"`
	Title        string    `json:"title"`
	TeamMembers  []string  `json:"team_members"`
	SupervisorID *string   `json:"supervisor_id,omitempty"`
	AcademicYear int       `json:"academic_year"`
	CourseCode   *string   `json:"course_code,omitempty"`
	Abstract     string    `json:"abstract"`
	Keywords     []string  `json:"keywords"`
	Status       string    `json:"status"`
	AccessTier   string    `json:"access_tier"`
	FilePath     *string   `json:"file_path,omitempty"`
	CreatedBy    string    `json:"created_by"`
	SubmittedAt  time.Time `json:"submitted_at"`
	ApprovedBy   *string   `json:"approved_by,omitempty"`
	ApprovedAt   *string   `json:"approved_at,omitempty"`
}

type SubmitProjectRequest struct {
	Title        string   `json:"title"`
	TeamMembers  []string `json:"team_members"`
	SupervisorID *string  `json:"supervisor_id,omitempty"`
	AcademicYear int      `json:"academic_year"`
	CourseCode   *string  `json:"course_code,omitempty"`
	Abstract     string   `json:"abstract"`
	Keywords     []string `json:"keywords"`
	FilePath     string   `json:"file_path"`
}

// POST /api/v1/projects
func (h *Handler) SubmitProject(w http.ResponseWriter, r *http.Request) {
	userID, ok := authpkg.GetUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Only students can submit projects
	roleTier, _ := authpkg.GetRoleTier(r)
	if roleTier != "student" && roleTier != "administrator" {
		writeError(w, http.StatusForbidden, "only students can submit projects")
		return
	}

	var req SubmitProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	// Validation
	if req.Title == "" || len(req.TeamMembers) == 0 || req.Abstract == "" || req.AcademicYear == 0 {
		writeError(w, http.StatusBadRequest, "title, team_members, abstract, and academic_year are required")
		return
	}

	if req.AcademicYear < 2000 || req.AcademicYear > 2100 {
		writeError(w, http.StatusBadRequest, "invalid academic year")
		return
	}

	// Validate supervisor is not a student
	if req.SupervisorID != nil {
		var supervisorRole string
		err := h.db.QueryRow(r.Context(),
			`SELECT role_tier FROM users WHERE user_id = $1`,
			*req.SupervisorID,
		).Scan(&supervisorRole)
		if err != nil {
			writeError(w, http.StatusBadRequest, "invalid supervisor")
			return
		}
		if supervisorRole == "student" {
			writeError(w, http.StatusBadRequest, "a student cannot supervise another student's project")
			return
		}
	}

	ctx := r.Context()
	tx, err := h.db.Begin(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to start transaction")
		return
	}
	defer tx.Rollback(ctx)

	// Create media_item
	itemID := uuid.New().String()
	_, err = tx.Exec(ctx,
		`INSERT INTO media_items (item_id, title, item_type, format, status, access_tier, created_by, file_path)
		 VALUES ($1, $2, 'project', 'pdf', 'draft', 'student', $3, $4)`,
		itemID, req.Title, userID, req.FilePath,
	)
	if err != nil {
		log.Printf("Failed to create media item: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	// Create metadata
	_, err = tx.Exec(ctx,
		`INSERT INTO media_metadata (item_id, abstract, keywords, language)
		 VALUES ($1, $2, $3, 'en')`,
		itemID, req.Abstract, req.Keywords,
	)
	if err != nil {
		log.Printf("Failed to create metadata: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	// Create student_project
	projectID := uuid.New().String()
	_, err = tx.Exec(ctx,
		`INSERT INTO student_projects (project_id, item_id, team_members, supervisor_id, academic_year, course_code)
		 VALUES ($1, $2, $3, $4, $5, $6)`,
		projectID, itemID, req.TeamMembers, req.SupervisorID, req.AcademicYear, req.CourseCode,
	)
	if err != nil {
		log.Printf("Failed to create student project: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to create project")
		return
	}

	if err := tx.Commit(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to commit transaction")
		return
	}

	writeJSON(w, http.StatusCreated, map[string]string{
		"message":    "project submitted successfully",
		"project_id": projectID,
		"item_id":    itemID,
	})
}

// GET /api/v1/projects
func (h *Handler) ListProjects(w http.ResponseWriter, r *http.Request) {
	_, ok := authpkg.GetUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	roleTier, _ := authpkg.GetRoleTier(r)
	status := r.URL.Query().Get("status")
	year := r.URL.Query().Get("year")

	var query string
	var args []interface{}
	argCount := 0

	// Build query based on role
	baseQuery := `SELECT sp.project_id, sp.item_id, m.title, sp.team_members, sp.supervisor_id, 
	                     sp.academic_year, sp.course_code, mm.abstract, mm.keywords, 
	                     m.status, m.access_tier, m.file_path, m.created_by, 
	                     sp.submitted_at, sp.approved_by, sp.approved_at
	              FROM student_projects sp
	              JOIN media_items m ON sp.item_id = m.item_id
	              JOIN media_metadata mm ON m.item_id = mm.item_id`

	var conditions []string

	if roleTier != "administrator" && roleTier != "librarian" {
		// Regular users see only published projects
		conditions = append(conditions, "m.status = 'published'")
	} else if status != "" {
		argCount++
		conditions = append(conditions, "m.status = $"+string(rune('0'+argCount)))
		args = append(args, status)
	}

	if year != "" {
		argCount++
		conditions = append(conditions, "sp.academic_year = $"+string(rune('0'+argCount)))
		args = append(args, year)
	}

	if len(conditions) > 0 {
		query = baseQuery + " WHERE " + conditions[0]
		for i := 1; i < len(conditions); i++ {
			query += " AND " + conditions[i]
		}
	} else {
		query = baseQuery
	}

	query += " ORDER BY sp.academic_year DESC, sp.submitted_at DESC"

	rows, err := h.db.Query(r.Context(), query, args...)
	if err != nil {
		log.Printf("Failed to query projects: %v", err)
		writeError(w, http.StatusInternalServerError, "failed to retrieve projects")
		return
	}
	defer rows.Close()

	var projects []StudentProject
	for rows.Next() {
		var p StudentProject
		err := rows.Scan(
			&p.ProjectID, &p.ItemID, &p.Title, &p.TeamMembers, &p.SupervisorID,
			&p.AcademicYear, &p.CourseCode, &p.Abstract, &p.Keywords,
			&p.Status, &p.AccessTier, &p.FilePath, &p.CreatedBy,
			&p.SubmittedAt, &p.ApprovedBy, &p.ApprovedAt,
		)
		if err != nil {
			log.Printf("Failed to scan project: %v", err)
			continue
		}
		projects = append(projects, p)
	}

	writeJSON(w, http.StatusOK, map[string]interface{}{
		"data":  projects,
		"total": len(projects),
	})
}

// GET /api/v1/projects/{projectId}
func (h *Handler) GetProject(w http.ResponseWriter, r *http.Request) {
	_, ok := authpkg.GetUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	projectID := chi.URLParam(r, "projectId")
	if projectID == "" {
		writeError(w, http.StatusBadRequest, "project_id is required")
		return
	}

	var p StudentProject
	err := h.db.QueryRow(r.Context(),
		`SELECT sp.project_id, sp.item_id, m.title, sp.team_members, sp.supervisor_id, 
		        sp.academic_year, sp.course_code, mm.abstract, mm.keywords, 
		        m.status, m.access_tier, m.file_path, m.created_by, 
		        sp.submitted_at, sp.approved_by, sp.approved_at
		 FROM student_projects sp
		 JOIN media_items m ON sp.item_id = m.item_id
		 JOIN media_metadata mm ON m.item_id = mm.item_id
		 WHERE sp.project_id = $1`,
		projectID,
	).Scan(
		&p.ProjectID, &p.ItemID, &p.Title, &p.TeamMembers, &p.SupervisorID,
		&p.AcademicYear, &p.CourseCode, &p.Abstract, &p.Keywords,
		&p.Status, &p.AccessTier, &p.FilePath, &p.CreatedBy,
		&p.SubmittedAt, &p.ApprovedBy, &p.ApprovedAt,
	)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}

	writeJSON(w, http.StatusOK, p)
}

// POST /api/v1/projects/{projectId}/approve
func (h *Handler) ApproveProject(w http.ResponseWriter, r *http.Request) {
	userID, ok := authpkg.GetUserID(r)
	if !ok {
		writeError(w, http.StatusUnauthorized, "unauthorized")
		return
	}

	// Only staff can approve
	roleTier, _ := authpkg.GetRoleTier(r)
	if roleTier != "librarian" && roleTier != "administrator" {
		writeError(w, http.StatusForbidden, "only staff can approve projects")
		return
	}

	projectID := chi.URLParam(r, "projectId")
	if projectID == "" {
		writeError(w, http.StatusBadRequest, "project_id is required")
		return
	}

	var req struct {
		Approved bool   `json:"approved"`
		Notes    string `json:"notes,omitempty"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		writeError(w, http.StatusBadRequest, "invalid request body")
		return
	}

	ctx := r.Context()
	tx, err := h.db.Begin(ctx)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to start transaction")
		return
	}
	defer tx.Rollback(ctx)

	// Get item_id
	var itemID string
	err = tx.QueryRow(ctx,
		`SELECT item_id FROM student_projects WHERE project_id = $1`,
		projectID,
	).Scan(&itemID)
	if err != nil {
		writeError(w, http.StatusNotFound, "project not found")
		return
	}

	// Update student_projects with approval info
	if req.Approved {
		_, err = tx.Exec(ctx,
			`UPDATE student_projects 
			 SET approved_by = $1, approved_at = NOW()
			 WHERE project_id = $2`,
			userID, projectID,
		)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "failed to update approval")
			return
		}
	}

	// Update media_items status
	newStatus := "draft"
	if req.Approved {
		newStatus = "published"
	}

	_, err = tx.Exec(ctx,
		`UPDATE media_items SET status = $1 WHERE item_id = $2`,
		newStatus, itemID,
	)
	if err != nil {
		writeError(w, http.StatusInternalServerError, "failed to update status")
		return
	}

	if err := tx.Commit(ctx); err != nil {
		writeError(w, http.StatusInternalServerError, "failed to commit transaction")
		return
	}

	writeJSON(w, http.StatusOK, map[string]string{
		"message": "project approval completed successfully",
		"status":  newStatus,
	})
}
