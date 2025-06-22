DROP TABLE IF EXISTS `attachments`;
CREATE TABLE IF NOT EXISTS `attachments` (
  `attachment_id` varchar(36) NOT NULL,
  `evidence_id` varchar(36) NOT NULL,
  `file_name` varchar(255) NOT NULL,
  `file_path` text NOT NULL,
  `file_type` varchar(100) NOT NULL,
  `file_size` bigint(20) DEFAULT NULL,
  `uploaded_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `uploaded_by` varchar(36) NOT NULL,
  PRIMARY KEY (`attachment_id`),
  KEY `evidence_id` (`evidence_id`),
  KEY `uploaded_by` (`uploaded_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;




DROP TABLE IF EXISTS `audit_log`;
CREATE TABLE IF NOT EXISTS `audit_log` (
  `audit_id` varchar(36) NOT NULL,
  `batch_id` varchar(36) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `record_id` varchar(64) NOT NULL,
  `field_name` varchar(64) NOT NULL,
  `value` text,
  `action_type` enum('INSERT','UPDATE','DELETE') NOT NULL,
  `changed_by` varchar(36) NOT NULL,
  `changed_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `batch_id` (`batch_id`),
  KEY `table_name` (`table_name`),
  KEY `record_id` (`record_id`),
  KEY `changed_by` (`changed_by`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `cases`;
CREATE TABLE IF NOT EXISTS `cases` (
  `case_id` varchar(36) NOT NULL,
  `topic` varchar(255) DEFAULT NULL,
  `case_type` enum('Criminal','Civil Dispute','Child Abuse','Missing Person','Domestic Violence','Drug Offense','Motorcycle Theft','Land Dispute','Assault and Battery','Murder/Homicide','Illegal Firearms Possession','Sexual Abuse','Human Trafficking','Public Disturbance','Fraud or Financial Crime','Cyber Crime','Robbery','Rape','Bribery or Corruption','Terrorism or Extremism','Traffic Accident','Illegal Construction or Land Grabbing','Suicide or Sudden Death Investigation','Political Protest') DEFAULT NULL,
  `status` enum('oicnotreviewed','inprogress','closed','oicrejected') NOT NULL,
  `started_dt` datetime DEFAULT NULL,
  `end_dt` datetime DEFAULT NULL,
  `leader_id` varchar(36) DEFAULT NULL,
  `complain_id` varchar(36) NOT NULL,
  PRIMARY KEY (`case_id`),
  KEY `leader_id` (`leader_id`),
  KEY `complain_id` (`complain_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `case_evidance`;
CREATE TABLE IF NOT EXISTS `case_evidance` (
  `case_id` varchar(36) NOT NULL,
  `evidence_id` varchar(36) NOT NULL,
  PRIMARY KEY (`case_id`,`evidence_id`),
  KEY `evidence_id` (`evidence_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `complaints`;
CREATE TABLE IF NOT EXISTS `complaints` (
  `complain_id` varchar(36) NOT NULL,
  `description` text NOT NULL,
  `complain_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `status` enum('new','viewed','closed') DEFAULT NULL,
  `officer_id` varchar(36) NOT NULL,
  `first_evidance_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`complain_id`),
  KEY `officer_id` (`officer_id`),
  KEY `fk_first_evidance` (`first_evidance_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;



DROP TABLE IF EXISTS `crimeoffence`;
CREATE TABLE IF NOT EXISTS `crimeoffence` (
  `offence_id` varchar(36) NOT NULL,
  `status` enum('Alleged','Acquitted','Convicted') DEFAULT 'Alleged',
  `crime_type` enum('Assault','Homicide','Manslaughter','Domestic Violence','Threatening Behavior','Armed Robbery','Kidnapping','Child Abduction','Burglary','Theft','Shoplifting','Vandalism','Arson','Vehicle Theft','Motorcycle Theft','Trespassing','Cyber Fraud','Phishing','Identity Theft','Online Harassment','Hacking','Cyberbullying','Data Breach','Embezzlement','Money Laundering','Bribery','Insider Trading','Tax Evasion','Forgery','Drug Possession','Drug Trafficking','Illegal Drug Manufacturing','Drug Smuggling','Sexual Assault','Rape','Indecent Exposure','Possession of Child Pornography','Disorderly Conduct','Public Intoxication','Loitering','Illegal Protests','Riot Participation','Human Trafficking','Smuggling','Illegal Possession of Firearms','Corruption','Extortion','Blackmail') DEFAULT NULL,
  `risk_score` int(11) DEFAULT NULL,
  `reported_dt` datetime DEFAULT NULL,
  `happened_dt` datetime DEFAULT NULL,
  `criminal_id` varchar(36) DEFAULT NULL,
  `case_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`offence_id`),
  KEY `criminal_id` (`criminal_id`),
  KEY `case_id` (`case_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `crimeoffence_evidance`;
CREATE TABLE IF NOT EXISTS `crimeoffence_evidance` (
  `offence_id` varchar(36) NOT NULL,
  `evidence_id` varchar(36) NOT NULL,
  PRIMARY KEY (`offence_id`,`evidence_id`),
  KEY `evidence_id` (`evidence_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `crimeoffence_victim`;
CREATE TABLE IF NOT EXISTS `crimeoffence_victim` (
  `offence_id` varchar(36) NOT NULL,
  `nic` varchar(36) NOT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`offence_id`,`nic`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `criminalrecord`;
CREATE TABLE IF NOT EXISTS `criminalrecord` (
  `criminal_id` varchar(36) NOT NULL,
  `fingerprint_hash` text,
  `photo` text,
  `nic` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`criminal_id`),
  UNIQUE KEY `nic` (`nic`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `evidance`;
CREATE TABLE IF NOT EXISTS `evidance` (
  `evidence_id` varchar(36) NOT NULL,
  `type` enum('Voice Statement','Written Statement','Fingerprint','Photograph','Video Footage','CCTV Recording','Phone Call Recording','DNA Sample','Blood Sample','Urine Sample','Saliva Sample','Hair Sample','Weapon','Firearm','Ammunition','Clothing','Footprint','Tool Mark','Document','Forged Document','Digital Document','Email Record','Chat Log','Bank Statement','ID Card','License Plate','Vehicle','Mobile Phone','Laptop','Hard Drive','USB Drive','Memory Card','Prescription','Medical Report','Threat Letter','Explosive Material','Drug Sample','Forensic Report','GPS Location Data','Social Media Post','Call Log','SIM Card','Network Log','Surveillance Photo','Witness Testimony','Confession Recording') NOT NULL,
  `location` text,
  `details` text,
  `collected_dt` datetime NOT NULL,
  `officer_id` varchar(36) DEFAULT NULL,
  `investigation_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`evidence_id`),
  KEY `officer_id` (`officer_id`),
  KEY `investigation_id` (`investigation_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;




DROP TABLE IF EXISTS `evidance_witnesses`;
CREATE TABLE IF NOT EXISTS `evidance_witnesses` (
  `evidence_id` varchar(36) NOT NULL,
  `nic` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` text,
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`evidence_id`,`nic`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS `forensicreport`;
CREATE TABLE IF NOT EXISTS `forensicreport` (
  `report_id` varchar(36) NOT NULL,
  `requested_dt` datetime DEFAULT NULL,
  `start_dt` datetime DEFAULT NULL,
  `end_dt` datetime DEFAULT NULL,
  `analysis_type` varchar(255) DEFAULT NULL,
  `result` text,
  `status` varchar(50) DEFAULT NULL,
  `officer_id` varchar(36) DEFAULT NULL,
  `remarks` text,
  `attachments` text,
  `evidence_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `officer_id` (`officer_id`),
  KEY `evidence_id` (`evidence_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `forensicreport_analysts`;
CREATE TABLE IF NOT EXISTS `forensicreport_analysts` (
  `report_id` varchar(36) NOT NULL,
  `analyst_id` varchar(36) NOT NULL,
  PRIMARY KEY (`report_id`,`analyst_id`),
  KEY `analyst_id` (`analyst_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `investigation`;
CREATE TABLE IF NOT EXISTS `investigation` (
  `investigation_id` varchar(36) NOT NULL,
  `topic` varchar(255) NOT NULL,
  `start_dt` datetime DEFAULT NULL,
  `end_dt` datetime DEFAULT NULL,
  `location` text,
  `status` enum('inprogress','closed','completed') DEFAULT NULL,
  `case_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`investigation_id`),
  KEY `case_id` (`case_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `investigation_officer`;
CREATE TABLE IF NOT EXISTS `investigation_officer` (
  `investigation_id` varchar(36) NOT NULL,
  `officer_id` varchar(36) NOT NULL,
  PRIMARY KEY (`investigation_id`,`officer_id`),
  KEY `officer_id` (`officer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;



DROP TABLE IF EXISTS `login`;
CREATE TABLE IF NOT EXISTS `login` (
  `user_id` varchar(36) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password_hash` text NOT NULL,
  `lastlogin_dt` datetime DEFAULT NULL,
  `faild_attempts` int(11) DEFAULT '0',
  `account_locked` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `notes`;
CREATE TABLE IF NOT EXISTS `notes` (
  `note_id` varchar(50) NOT NULL,
  `reference_table` varchar(50) NOT NULL,
  `reference_id` varchar(50) NOT NULL,
  `description` text,
  `created_by` varchar(50) NOT NULL,
  `receiver` varchar(50) NOT NULL,
  `read_status` tinyint(1) DEFAULT '0',
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`note_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;



DROP TABLE IF EXISTS `notifications`;
CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `title` varchar(255) NOT NULL,
  `message` text NOT NULL,
  `type` enum('info','warning','success','error','system') DEFAULT 'info',
  `is_read` tinyint(1) DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `related_id` varchar(36) DEFAULT NULL,
  `related_type` varchar(64) DEFAULT NULL,
  PRIMARY KEY (`notification_id`),
  KEY `user_id` (`user_id`),
  KEY `is_read` (`is_read`),
  KEY `created_at` (`created_at`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;


DROP TABLE IF EXISTS `users`;
CREATE TABLE IF NOT EXISTS `users` (
  `user_id` varchar(36) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(100) NOT NULL,
  `nic` varchar(15) NOT NULL,
  `phone` varchar(20) NOT NULL,
  `address` text NOT NULL,
  `created_dt` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `role` enum('OIC','Crime OIC','Sub Inspector','Sergeant','Police Constable','Forensic Officer','Inspector') NOT NULL,
  `profile_pic` text,
  PRIMARY KEY (`user_id`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `NIC` (`nic`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- Online Complaints Table
DROP TABLE IF EXISTS online_complaints;
CREATE TABLE IF NOT EXISTS online_complaints (
  complaint_id VARCHAR(36) NOT NULL,
  complaint_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  complainant_full_name VARCHAR(100) NOT NULL,
  nic_no VARCHAR(20) NOT NULL,
  dob DATE NOT NULL,
  phone_no VARCHAR(20) NOT NULL,
  email VARCHAR(100) NOT NULL,
  address VARCHAR(255) NOT NULL,
  complaint_date DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status ENUM('new','viewed','closed') NOT NULL DEFAULT 'new',
  PRIMARY KEY (complaint_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

DROP TABLE IF EXISTS online_complaint_evidence;
CREATE TABLE IF NOT EXISTS online_complaint_evidence (
  evidence_id VARCHAR(36) NOT NULL,
  complaint_id VARCHAR(36) NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  original_name VARCHAR(255) DEFAULT NULL,
  file_type VARCHAR(100) NOT NULL,
  file_size BIGINT DEFAULT NULL,
  file_url TEXT NOT NULL,
  uploaded_dt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (evidence_id),
  KEY complaint_id (complaint_id)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;