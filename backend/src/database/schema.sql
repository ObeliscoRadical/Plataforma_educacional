-- DEVELOPER OS DATABASE SCHEMA (SQLite 3 + WAL)

CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    name TEXT NOT NULL,
    handle TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'STUDENT', -- STUDENT, ADMIN, MENTOR
    avatar TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS admin_settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    description TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS courses (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT NOT NULL,
    level TEXT NOT NULL DEFAULT 'BEGINNER_TO_PRO',
    is_published INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS modules (
    id TEXT PRIMARY KEY,
    course_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g. MOD_00, MOD_01 ... MOD_23
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    summary TEXT NOT NULL,
    icon TEXT,
    status TEXT DEFAULT 'AVAILABLE', -- LOCKED, AVAILABLE, IN_PROGRESS, COMPLETED
    FOREIGN KEY(course_id) REFERENCES courses(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lessons (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    order_index INTEGER NOT NULL,
    code TEXT UNIQUE NOT NULL, -- e.g. 00.01, 01.02
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    duration_min INTEGER DEFAULT 15,
    difficulty TEXT DEFAULT 'MEDIUM', -- INTRO, EASY, MEDIUM, HARD, ADVANCED
    is_checkpoint INTEGER DEFAULT 0,
    FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS lesson_contents (
    id TEXT PRIMARY KEY,
    lesson_id TEXT UNIQUE NOT NULL,
    objective TEXT NOT NULL,
    prerequisites TEXT, -- JSON array
    competences TEXT, -- JSON array of skill codes
    content_markdown TEXT NOT NULL,
    guided_practice_markdown TEXT,
    expected_output TEXT,
    commented_solution TEXT,
    resources TEXT, -- JSON array
    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS video_lessons (
    id TEXT PRIMARY KEY,
    lesson_id TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    duration_seconds INTEGER DEFAULT 0,
    video_url TEXT,
    thumbnail_url TEXT,
    transcript_json TEXT, -- JSON array of scenes and narration
    status TEXT DEFAULT 'DRAFT', -- DRAFT, GENERATING, GENERATED, REVIEW_REQUIRED, APPROVED, PUBLISHED, FAILED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS video_generation_jobs (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    status TEXT DEFAULT 'DRAFT', -- DRAFT, GENERATING, GENERATED, REVIEW_REQUIRED, APPROVED, PUBLISHED, FAILED
    script_json TEXT,
    narration_data TEXT,
    screen_plan_json TEXT,
    visual_assets_json TEXT,
    logs TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS exercises (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    initial_code TEXT NOT NULL,
    solution_code TEXT NOT NULL,
    test_cases_json TEXT NOT NULL, -- JSON array of { name, input, expected, hidden }
    difficulty TEXT DEFAULT 'MEDIUM',
    order_index INTEGER DEFAULT 0,
    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS challenges (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    prompt TEXT NOT NULL,
    starter_files_json TEXT, -- JSON map { 'index.html': '...', 'app.js': '...' }
    verification_criteria_json TEXT, -- JSON array
    xp_reward INTEGER DEFAULT 100,
    FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS quizzes (
    id TEXT PRIMARY KEY,
    lesson_id TEXT NOT NULL,
    title TEXT NOT NULL,
    passing_score INTEGER DEFAULT 80,
    is_adaptive INTEGER DEFAULT 1,
    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS questions (
    id TEXT PRIMARY KEY,
    quiz_id TEXT NOT NULL,
    prompt TEXT NOT NULL,
    explanation TEXT,
    difficulty_level INTEGER DEFAULT 1, -- 1 to 5
    skill_id TEXT,
    weight REAL DEFAULT 1.0,
    FOREIGN KEY(quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS answers (
    id TEXT PRIMARY KEY,
    question_id TEXT NOT NULL,
    text TEXT NOT NULL,
    is_correct INTEGER DEFAULT 0,
    explanation TEXT,
    FOREIGN KEY(question_id) REFERENCES questions(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS attempts (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    exercise_id TEXT,
    quiz_id TEXT,
    code_submitted TEXT,
    score REAL DEFAULT 0,
    status TEXT NOT NULL, -- PASSED, FAILED, ASSISTED
    hints_used_count INTEGER DEFAULT 0,
    max_hint_level INTEGER DEFAULT 0, -- 0 to 5
    execution_output TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS skills (
    id TEXT PRIMARY KEY,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- FUNDAMENTALS, FRONTEND, BACKEND, ARCHITECTURE, DEVOPS, AI_ENGINEERING
    description TEXT,
    icon TEXT
);

CREATE TABLE IF NOT EXISTS student_skills (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    status TEXT DEFAULT 'NOT_LEARNED', -- NOT_LEARNED, FRAGILE, ASSISTED, MASTERED
    knowledge_score REAL DEFAULT 0,
    implementation_score REAL DEFAULT 0,
    problem_solving_score REAL DEFAULT 0,
    debugging_score REAL DEFAULT 0,
    autonomy_score REAL DEFAULT 100,
    composite_score REAL DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, skill_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS student_progress (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    module_id TEXT NOT NULL,
    lesson_id TEXT NOT NULL,
    status TEXT DEFAULT 'LOCKED', -- LOCKED, AVAILABLE, IN_PROGRESS, NEEDS_REVIEW, COMPLETED
    video_watched INTEGER DEFAULT 0,
    exercise_completed INTEGER DEFAULT 0,
    quiz_passed INTEGER DEFAULT 0,
    completed_at DATETIME,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, lesson_id),
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE,
    FOREIGN KEY(lesson_id) REFERENCES lessons(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentor_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    lesson_id TEXT,
    context_state_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS mentor_feedbacks (
    id TEXT PRIMARY KEY,
    session_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    message TEXT NOT NULL,
    sender TEXT NOT NULL, -- USER, MENTOR_AI
    hint_level INTEGER DEFAULT 0, -- 0 to 5
    code_snippet TEXT,
    analysis_json TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(session_id) REFERENCES mentor_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS remedial_lessons (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    skill_id TEXT NOT NULL,
    triggered_by_lesson_id TEXT,
    title TEXT NOT NULL,
    reason TEXT NOT NULL,
    content_markdown TEXT NOT NULL,
    micro_exercise_json TEXT NOT NULL,
    status TEXT DEFAULT 'PENDING', -- PENDING, COMPLETED
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY(skill_id) REFERENCES skills(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    tier INTEGER DEFAULT 1,
    rubric_json TEXT NOT NULL,
    template_repo_url TEXT,
    required_skills TEXT, -- JSON array
    FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS project_submissions (
    id TEXT PRIMARY KEY,
    project_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    repository_url TEXT,
    deploy_url TEXT,
    code_files_json TEXT, -- JSON map or files
    mentor_review_json TEXT,
    grade REAL DEFAULT 0,
    status TEXT DEFAULT 'SUBMITTED', -- SUBMITTED, UNDER_REVIEW, CHANGES_REQUESTED, APPROVED
    submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    FOREIGN KEY(project_id) REFERENCES projects(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS practical_exams (
    id TEXT PRIMARY KEY,
    module_id TEXT NOT NULL,
    title TEXT NOT NULL,
    time_limit_minutes INTEGER DEFAULT 60,
    test_suite_json TEXT NOT NULL,
    stages_json TEXT NOT NULL,
    FOREIGN KEY(module_id) REFERENCES modules(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS final_exams (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    stage1_knowledge_score REAL DEFAULT 0,
    stage2_debugging_score REAL DEFAULT 0,
    stage3_feature_score REAL DEFAULT 0,
    stage4_defense_transcript TEXT,
    stage4_defense_score REAL DEFAULT 0,
    overall_grade REAL DEFAULT 0,
    status TEXT DEFAULT 'IN_PROGRESS', -- IN_PROGRESS, PASSED, FAILED
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS learning_events (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    payload_json TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- INDEXES FOR MAXIMUM QUERY EFFICIENCY
CREATE INDEX IF NOT EXISTS idx_modules_course ON modules(course_id, order_index);
CREATE INDEX IF NOT EXISTS idx_lessons_module ON lessons(module_id, order_index);
CREATE INDEX IF NOT EXISTS idx_progress_user_mod ON student_progress(user_id, module_id);
CREATE INDEX IF NOT EXISTS idx_progress_user_lesson ON student_progress(user_id, lesson_id);
CREATE INDEX IF NOT EXISTS idx_student_skills_user ON student_skills(user_id);
CREATE INDEX IF NOT EXISTS idx_events_user_type ON learning_events(user_id, event_type);
CREATE INDEX IF NOT EXISTS idx_attempts_user ON attempts(user_id);
