CREATE TABLE UserSessions (
    session_id VARCHAR(36) PRIMARY KEY, 
    user_id VARCHAR(36) NOT NULL, 
    device_info TEXT NOT NULL, 
    login_time DATETIME DEFAULT CURRENT_TIMESTAMP, 
    last_activity DATETIME DEFAULT CURRENT_TIMESTAMP, 
    current_cookie TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES Users(user_id) ON DELETE CASCADE
);



CREATE TABLE Login (
    user_id VARCHAR(36) PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    faild_attempts INT DEFAULT 0,
    account_locked BOOLEAN DEFAULT FALSE
);

CREATE TABLE Roles (
    role_id VARCHAR(36) PRIMARY KEY,
    rolename VARCHAR(50) UNIQUE NOT NULL
);

CREATE TABLE Users (
    user_id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_dt DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
    role_id VARCHAR(36) NOT NULL,
    FOREIGN KEY (role_id) REFERENCES Roles(role_id)
);

CREATE TABLE Complaints (
    complain_id VARCHAR(36) PRIMARY KEY,
    description TEXT NOT NULL,
    complain_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50),
    officer_id VARCHAR(36),
    complainer_id VARCHAR(36),
    FOREIGN KEY (officer_id) REFERENCES Users(user_id),
    FOREIGN KEY (complainer_id) REFERENCES Evidance_Witnesses(nic)
);

CREATE TABLE Cases (
    case_id VARCHAR(36) PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    case_type VARCHAR(255),
    status VARCHAR(50),
    started_dt DATETIME,
    end_dt DATETIME,
    leader_id VARCHAR(36),
    complain_id VARCHAR(36),
    FOREIGN KEY (leader_id) REFERENCES Users(user_id),
    FOREIGN KEY (complain_id) REFERENCES Complaints(complain_id)
);

CREATE TABLE Investigation (
    investigation_id VARCHAR(36) PRIMARY KEY,
    topic VARCHAR(255) NOT NULL,
    start_dt DATETIME,
    end_dt DATETIME,
    location TEXT,
    status VARCHAR(50),
    case_id VARCHAR(36),
    FOREIGN KEY (case_id) REFERENCES Cases(case_id)
);

CREATE TABLE Investigation_Officer (
    investigation_id VARCHAR(36),
    officer_id VARCHAR(36),
    PRIMARY KEY (investigation_id, officer_id),
    FOREIGN KEY (investigation_id) REFERENCES Investigation(investigation_id),
    FOREIGN KEY (officer_id) REFERENCES Users(user_id)
);

CREATE TABLE Evidance (
    evidence_id VARCHAR(36) PRIMARY KEY,
    type VARCHAR(255),
    location TEXT,
    details TEXT,
    officer_id VARCHAR(36),
    investigation_id VARCHAR(36),
    FOREIGN KEY (officer_id) REFERENCES Users(user_id),
    FOREIGN KEY (investigation_id) REFERENCES Investigation(investigation_id)
);

CREATE TABLE Evidance_Witnesses (
    evidence_id VARCHAR(36),
    nic VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    dob DATE,
    FOREIGN KEY (evidence_id) REFERENCES Evidance(evidence_id)
);

CREATE TABLE Case_Evidance (
    case_id VARCHAR(36),
    evidence_id VARCHAR(36),
    PRIMARY KEY (case_id, evidence_id),
    FOREIGN KEY (case_id) REFERENCES Cases(case_id),
    FOREIGN KEY (evidence_id) REFERENCES Evidance(evidence_id)
);

CREATE TABLE ForensicReport (
    report_id VARCHAR(36) PRIMARY KEY,
    requested_dt DATETIME,
    start_dt DATETIME,
    end_dt DATETIME,
    analysis_type VARCHAR(255),
    result TEXT,
    status VARCHAR(50),
    officer_id VARCHAR(36),
    remarks TEXT,
    attachments TEXT,
    evidence_id VARCHAR(36),
    FOREIGN KEY (officer_id) REFERENCES Users(user_id),
    FOREIGN KEY (evidence_id) REFERENCES Evidance(evidence_id)
);

CREATE TABLE ForensicReport_Analysts (
    report_id VARCHAR(36),
    analyst_id VARCHAR(36),
    PRIMARY KEY (report_id, analyst_id),
    FOREIGN KEY (report_id) REFERENCES ForensicReport(report_id),
    FOREIGN KEY (analyst_id) REFERENCES Users(user_id)
);

CREATE TABLE CriminalRecord (
    criminal_id VARCHAR(36) PRIMARY KEY,
    fingerprint_hash TEXT NOT NULL,
    photo TEXT,
    total_crimes INT DEFAULT 0,
    total_risk DECIMAL(5,2) DEFAULT 0.00   -- upto 1000.00
);

CREATE TABLE CrimeOffence (
    offence_id VARCHAR(36) PRIMARY KEY,
    status VARCHAR(50),
    crime_type VARCHAR(255),
    risk_score DECIMAL(5,2),
    reported_dt DATETIME,
    happened_dt DATETIME,
    criminal_id VARCHAR(36),
    case_id VARCHAR(36),
    FOREIGN KEY (criminal_id) REFERENCES CriminalRecord(criminal_id),
    FOREIGN KEY (case_id) REFERENCES Cases(case_id)
);

CREATE TABLE CrimeOffence_Victim (
    offence_id VARCHAR(36),
    nic VARCHAR(36),
    name VARCHAR(255),
    phone VARCHAR(20),
    address TEXT,
    dob DATE,
    PRIMARY KEY (offence_id, nic),
    FOREIGN KEY (offence_id) REFERENCES CrimeOffence(offence_id)
);

CREATE TABLE CrimeOffence_Evidance (
    offence_id VARCHAR(36),
    evidence_id VARCHAR(36),
    PRIMARY KEY (offence_id, evidence_id),
    FOREIGN KEY (offence_id) REFERENCES CrimeOffence(offence_id),
    FOREIGN KEY (evidence_id) REFERENCES Evidance(evidence_id)
);

CREATE TABLE Reports (
    report_id VARCHAR(36) PRIMARY KEY,
    report_type VARCHAR(255),
    content TEXT,
    remarks TEXT,
    status VARCHAR(50),
    created_dt DATETIME DEFAULT CURRENT_TIMESTAMP,
    officer_id VARCHAR(36),
    FOREIGN KEY (officer_id) REFERENCES Users(user_id)
);

CREATE TABLE Report_Refrences (
    report_id VARCHAR(36),
    ref_id VARCHAR(36),
    ref_type VARCHAR(255),
    PRIMARY KEY (report_id, ref_id),
    FOREIGN KEY (report_id) REFERENCES Reports(report_id)
);
