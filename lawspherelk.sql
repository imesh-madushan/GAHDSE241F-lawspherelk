-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: May 30, 2025 at 05:57 AM
-- Server version: 5.7.36
-- PHP Version: 8.1.0

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lawspherelk`
--

-- --------------------------------------------------------

--
-- Table structure for table `audit_log`
--

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

--
-- Dumping data for table `audit_log`
--

INSERT INTO `audit_log` (`audit_id`, `batch_id`, `table_name`, `record_id`, `field_name`, `value`, `action_type`, `changed_by`, `changed_at`) VALUES
('AUD1111981901', 'B1072279694', 'complaints', 'CMP001', 'status', 'closed', 'UPDATE', 'U001', '2025-05-29 23:08:39'),
('AUD7101941941', 'B1072279694', 'cases', 'C001', 'status', 'oicrejected', 'UPDATE', 'U001', '2025-05-29 23:08:39'),
('AUD6125721983', 'B2521907045', 'cases', 'C9818234044', 'status', 'inprogress', 'UPDATE', 'U002', '2025-05-29 23:47:30'),
('AUD8415667402', 'B2521907045', 'cases', 'C9818234044', 'topic', 'Bike theft', 'INSERT', 'U002', '2025-05-29 23:47:30'),
('AUD2795792874', 'B2521907045', 'cases', 'C9818234044', 'started_dt', '2025-05-29T18:17:30.718Z', 'INSERT', 'U002', '2025-05-29 23:47:30'),
('AUD0497573427', 'B2521907045', 'cases', 'C9818234044', 'leader_id', 'U002', 'INSERT', 'U002', '2025-05-29 23:47:30'),
('AUD9833002912', 'B2521907045', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U002', '2025-05-29 23:47:30'),
('AUD8348914338', 'B6521215820', 'evidance', 'EVD8738612103', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD6253810573', 'B6521215820', 'evidance', 'EVD8738612103', 'details', 'civil dispute 1', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD0953072820', 'B6521215820', 'evidance', 'EVD8738612103', 'officer_id', 'U001', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD5054966477', 'B6521215820', 'complaints', 'CMP3538836277', 'description', 'civil dispute 1', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD3043376006', 'B6521215820', 'complaints', 'CMP3538836277', 'status', 'new', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD0166505317', 'B6521215820', 'complaints', 'CMP3538836277', 'officer_id', 'U001', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD1976097203', 'B6521215820', 'complaints', 'CMP3538836277', 'first_evidance_id', 'EVD8738612103', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD7874112125', 'B6521215820', 'evidance_witnesses', 'EVD8738612103_200220202220', 'nic', '200220202220', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD1687627808', 'B6521215820', 'evidance_witnesses', 'EVD8738612103_200220202220', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD4665511351', 'B6521215820', 'evidance_witnesses', 'EVD8738612103_200220202220', 'phone', '0768141745', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD6876443532', 'B6521215820', 'evidance_witnesses', 'EVD8738612103_200220202220', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD0099703995', 'B6521215820', 'evidance_witnesses', 'EVD8738612103_200220202220', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD4957848547', 'B6521215820', 'evidance_witnesses', 'EVD8738612103_200220202220', 'dob', '2003-03-03', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD6966436869', 'B6521215820', 'cases', 'C9999816989', 'case_type', 'Civil Dispute', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD4668969787', 'B6521215820', 'cases', 'C9999816989', 'status', 'oicnotreviewed', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD5591885200', 'B6521215820', 'cases', 'C9999816989', 'complain_id', 'CMP3538836277', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD3369797090', 'B6521215820', 'case_evidance', 'C9999816989_EVD8738612103', 'case_id', 'C9999816989', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD0084824391', 'B6521215820', 'case_evidance', 'C9999816989_EVD8738612103', 'evidence_id', 'EVD8738612103', 'INSERT', 'U001', '2025-05-29 23:49:30'),
('AUD1219062609', 'B7848159803', 'complaints', 'CMP3538836277', 'status', 'closed', 'UPDATE', 'U001', '2025-05-29 23:50:23'),
('AUD1971762057', 'B7848159803', 'cases', 'C9999816989', 'status', 'oicrejected', 'UPDATE', 'U001', '2025-05-29 23:50:23');

-- --------------------------------------------------------

--
-- Table structure for table `cases`
--

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

--
-- Dumping data for table `cases`
--

INSERT INTO `cases` (`case_id`, `topic`, `case_type`, `status`, `started_dt`, `end_dt`, `leader_id`, `complain_id`) VALUES
('C001', NULL, 'Motorcycle Theft', 'oicrejected', '2025-05-26 15:01:04', '2025-05-29 23:08:39', NULL, 'CMP001'),
('C002', 'Missing Child Reported by School', 'Missing Person', 'inprogress', '2025-04-02 10:00:00', NULL, 'U005', 'CMP002'),
('C003', 'Gang Threat to School Principal', 'Criminal', 'inprogress', '2025-04-03 11:30:00', NULL, 'U002', 'CMP005'),
('C004', 'Vehicle Theft – Honda CB150', 'Robbery', 'closed', '2025-04-04 18:00:00', '2025-05-25 00:37:03', 'U004', 'CMP004'),
('C005', 'Online Scam – Fake Police Jobs', 'Cyber Crime', 'closed', '2025-03-28 14:00:00', '2025-04-01 17:30:00', 'U001', 'CMP003'),
('C9818234044', 'Bike theft', 'Criminal', 'inprogress', '2025-05-29 23:47:31', NULL, 'U002', 'CMP3591845754'),
('C9999816989', NULL, 'Civil Dispute', 'oicrejected', NULL, '2025-05-29 23:50:23', NULL, 'CMP3538836277');

-- --------------------------------------------------------

--
-- Table structure for table `case_evidance`
--

DROP TABLE IF EXISTS `case_evidance`;
CREATE TABLE IF NOT EXISTS `case_evidance` (
  `case_id` varchar(36) NOT NULL,
  `evidence_id` varchar(36) NOT NULL,
  PRIMARY KEY (`case_id`,`evidence_id`),
  KEY `evidence_id` (`evidence_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `case_evidance`
--

INSERT INTO `case_evidance` (`case_id`, `evidence_id`) VALUES
('C001', 'EVD001'),
('C002', 'EVD002'),
('C003', 'EVD003'),
('C004', 'EVD004'),
('C004', 'EVD006'),
('C005', 'EVD005'),
('C9818234044', 'EVD0425084493'),
('C9999816989', 'EVD8738612103');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

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

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`complain_id`, `description`, `complain_dt`, `status`, `officer_id`, `first_evidance_id`) VALUES
('CMP001', 'Stolen motorcycle from residence at 23 Galle Road. Black Honda CB150, license KU-2343.', '2025-04-12 16:11:00', 'closed', 'U001', 'EVD001'),
('CMP002', 'A child from Colombo Central School went missing during school hours. Last seen near back gate.', '2025-04-02 09:50:00', 'viewed', 'U005', 'EVD002'),
('CMP003', 'Multiple citizens reported an online scam claiming to offer fake police job openings.', '2025-03-28 13:45:00', 'viewed', 'U003', 'EVD003'),
('CMP004', 'Motorcycle stolen from galle BOC bank area. Honda CB150, license plate WP-KU2343.', '2025-04-03 18:00:00', 'viewed', 'U003', 'EVD004'),
('CMP005', 'School principal received anonymous threats via phone from suspected gang members.', '2025-04-05 08:00:00', 'viewed', 'U002', 'EVD005'),
('CMP3538836277', 'civil dispute 1', '2025-05-29 23:49:30', 'closed', 'U001', 'EVD8738612103'),
('CMP3591845754', 'This is a test complaint.', '2025-05-26 00:31:04', 'viewed', 'U002', 'EVD0425084493');

-- --------------------------------------------------------

--
-- Table structure for table `crimeoffence`
--

DROP TABLE IF EXISTS `crimeoffence`;
CREATE TABLE IF NOT EXISTS `crimeoffence` (
  `offence_id` varchar(36) NOT NULL,
  `status` enum('Alleged','Acquitted','Convicted') DEFAULT NULL,
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

--
-- Dumping data for table `crimeoffence`
--

INSERT INTO `crimeoffence` (`offence_id`, `status`, `crime_type`, `risk_score`, `reported_dt`, `happened_dt`, `criminal_id`, `case_id`) VALUES
('OFF002', 'Alleged', 'Child Abduction', 85, '2025-04-02 09:50:00', '2025-04-02 09:45:00', 'CRIM002', 'C002'),
('OFF003', 'Convicted', 'Cyber Fraud', 60, '2025-03-28 13:45:00', '2025-03-27 20:00:00', 'CRIM003', 'C005'),
('OFF004', 'Convicted', 'Motorcycle Theft', 65, '2025-04-03 18:00:00', '2025-04-03 17:45:00', 'CRIM004', 'C004'),
('OFF005', 'Convicted', 'Threatening Behavior', 75, '2025-04-05 08:00:00', '2025-04-04 21:00:00', 'CRIM005', 'C003');

-- --------------------------------------------------------

--
-- Table structure for table `crimeoffence_evidance`
--

DROP TABLE IF EXISTS `crimeoffence_evidance`;
CREATE TABLE IF NOT EXISTS `crimeoffence_evidance` (
  `offence_id` varchar(36) NOT NULL,
  `evidence_id` varchar(36) NOT NULL,
  PRIMARY KEY (`offence_id`,`evidence_id`),
  KEY `evidence_id` (`evidence_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `crimeoffence_evidance`
--

INSERT INTO `crimeoffence_evidance` (`offence_id`, `evidence_id`) VALUES
('OFF002', 'EVD002'),
('OFF003', 'EVD003'),
('OFF004', 'EVD004'),
('OFF004', 'EVD006'),
('OFF005', 'EVD005');

-- --------------------------------------------------------

--
-- Table structure for table `crimeoffence_victim`
--

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

--
-- Dumping data for table `crimeoffence_victim`
--

INSERT INTO `crimeoffence_victim` (`offence_id`, `nic`, `name`, `phone`, `address`, `dob`) VALUES
('OFF002', 'NIC201005555V', 'Kavindu Silva', '0779876543', 'Colombo Central School Hostel, Colombo 10', '2010-05-05'),
('OFF003', 'NIC199312345V', 'Ishara Fernando', '0713456789', '12/A Green Lane, Kurunegala', '1993-07-20'),
('OFF004', 'NIC198905432V', 'Roshan Jayasinghe', '0752223344', '43 Temple Road, Pettah', '1989-06-15'),
('OFF005', 'NIC197512345V', 'Principal R. Silva', '0759876543', 'Colombo Central College, Colombo 07', '1975-12-01');

-- --------------------------------------------------------

--
-- Table structure for table `criminalrecord`
--

DROP TABLE IF EXISTS `criminalrecord`;
CREATE TABLE IF NOT EXISTS `criminalrecord` (
  `criminal_id` varchar(36) NOT NULL,
  `fingerprint_hash` text NOT NULL,
  `photo` text,
  `nic` varchar(36) DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text,
  `dob` date DEFAULT NULL,
  PRIMARY KEY (`criminal_id`),
  UNIQUE KEY `nic` (`nic`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `criminalrecord`
--

INSERT INTO `criminalrecord` (`criminal_id`, `fingerprint_hash`, `photo`, `nic`, `name`, `phone`, `address`, `dob`) VALUES
('CRIM001', 'abcdef1234567890', 'https://randomuser.me/api/portraits/men/12.jpg', '198877665544', 'Devinda Silva', '0779988776', '45, Park Road, Colombo', '1996-06-25'),
('CRIM002', 'fedcba0987654321', 'https://randomuser.me/api/portraits/men/13.jpg', '199511223344', 'Saman Perera', '0711233455', '10/A, Hill Street, Kandy', '1995-09-12'),
('CRIM003', '9876543210abcdef', 'https://randomuser.me/api/portraits/men/14.jpg', '200055443322', 'Nayana Kumari', '0705566778', '7, Lake View, Galle', '2000-02-01'),
('CRIM004', '0123456789fedcba', 'https://randomuser.me/api/portraits/men/15.jpg', '199233445566', 'Asanka Wijeratne', '0766544321', '12B, Sea Road, Negombo', '1992-11-05'),
('CRIM005', 'bacdef0123456789', 'https://randomuser.me/api/portraits/men/16.jpg', '200499887766', 'Dilani Fernando', '0722344566', '3rd Lane, Kurunegala', '2004-04-28');

-- --------------------------------------------------------

--
-- Table structure for table `evidance`
--

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

--
-- Dumping data for table `evidance`
--

INSERT INTO `evidance` (`evidence_id`, `type`, `location`, `details`, `collected_dt`, `officer_id`, `investigation_id`) VALUES
('EVD001', 'Voice Statement', NULL, 'I saw that kamal theft a motocycle', '2025-04-02 00:05:00', 'U001', NULL),
('EVD004', 'Voice Statement', NULL, 'Victim stated he parked the bike at 4:30 PM and it was missing by 5:10 PM.', '2025-04-03 18:30:00', 'U003', NULL),
('EVD006', 'Fingerprint', 'bank BOC', 'collect fingerprint data from a dropped leather wallet', '2025-04-30 08:53:59', 'U005', 'INV001'),
('EVD003', 'Voice Statement', NULL, 'Victim described a phone call claiming fake police recruitment.', '2025-03-28 15:00:00', 'U003', NULL),
('EVD002', 'Voice Statement', NULL, 'Complainer explained child was last seen at 2:00 PM near the canteen.', '2025-04-02 10:15:00', 'U005', NULL),
('EVD005', 'Voice Statement', NULL, 'Principal stated a caller warned about consequences if payment was not made.', '2025-04-05 08:30:00', 'U002', NULL),
('EVD0425084493', 'Voice Statement', NULL, 'Voice statement details for test.', '2025-05-26 00:31:04', 'U002', NULL),
('EVD8738612103', 'Voice Statement', NULL, 'civil dispute 1', '2025-05-29 23:49:30', 'U001', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `evidance_witnesses`
--

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

--
-- Dumping data for table `evidance_witnesses`
--

INSERT INTO `evidance_witnesses` (`evidence_id`, `nic`, `name`, `phone`, `email`, `address`, `dob`) VALUES
('EVD001', '200222222222', 'jason', '0771234567', 'j@gmail.com', 'Batduwa, Galle.', '2000-04-01'),
('EVD002', 'NIC900000002V', 'Vimukthi Perera', '0774561230', 'v@gmail.com', 'Colombo Central School, Colombo 10', '2008-05-14'),
('EVD003', 'NIC900000003V', 'Nuwan Senanayake', '0767895432', 'nuwan@gmail.com', 'Kurunegala Town', '1992-08-25'),
('EVD004', 'NIC900000004V', 'Ajith Kumara', '0712345678', 'ajoth@gmail.com', 'Pettah Bus Stand Area', '1985-03-10'),
('EVD005', 'NIC900000005V', 'Principal R. Silva', '0756543210', 'silva@gmail.com', 'Colombo 07', '1975-12-05'),
('EVD8738612103', '200220202220', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2003-03-03'),
('EVD0425084493', '900000000V', 'Test User', '0771234567', 'test@example.com', '123 Main St', '2000-01-01');

-- --------------------------------------------------------

--
-- Table structure for table `forensicreport`
--

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

-- --------------------------------------------------------

--
-- Table structure for table `forensicreport_analysts`
--

DROP TABLE IF EXISTS `forensicreport_analysts`;
CREATE TABLE IF NOT EXISTS `forensicreport_analysts` (
  `report_id` varchar(36) NOT NULL,
  `analyst_id` varchar(36) NOT NULL,
  PRIMARY KEY (`report_id`,`analyst_id`),
  KEY `analyst_id` (`analyst_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `investigation`
--

DROP TABLE IF EXISTS `investigation`;
CREATE TABLE IF NOT EXISTS `investigation` (
  `investigation_id` varchar(36) NOT NULL,
  `topic` varchar(255) NOT NULL,
  `start_dt` datetime DEFAULT NULL,
  `end_dt` datetime DEFAULT NULL,
  `location` text,
  `status` enum('inprogress','closed') DEFAULT NULL,
  `case_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`investigation_id`),
  KEY `case_id` (`case_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `investigation`
--

INSERT INTO `investigation` (`investigation_id`, `topic`, `start_dt`, `end_dt`, `location`, `status`, `case_id`) VALUES
('INV001', 'check for evidence for bike stoel at BOC bank', '2025-04-10 14:26:30', '2025-04-16 14:26:30', 'bank BOC', 'closed', 'C004');

-- --------------------------------------------------------

--
-- Table structure for table `investigation_officer`
--

DROP TABLE IF EXISTS `investigation_officer`;
CREATE TABLE IF NOT EXISTS `investigation_officer` (
  `investigation_id` varchar(36) NOT NULL,
  `officer_id` varchar(36) NOT NULL,
  PRIMARY KEY (`investigation_id`,`officer_id`),
  KEY `officer_id` (`officer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `investigation_officer`
--

INSERT INTO `investigation_officer` (`investigation_id`, `officer_id`) VALUES
('INV001', 'U004'),
('INV001', 'U005');

-- --------------------------------------------------------

--
-- Table structure for table `login`
--

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

--
-- Dumping data for table `login`
--

INSERT INTO `login` (`user_id`, `username`, `password_hash`, `lastlogin_dt`, `faild_attempts`, `account_locked`) VALUES
('U001', 'user1', '$2b$10$.xeyDmg6SzYkxVF4joycreg4ANiSfiNFhiqt39i0lPKGUIkfyI4/a', '2025-05-13 01:47:56', 0, 0),
('U002', 'user2', '$2b$10$.xeyDmg6SzYkxVF4joycreg4ANiSfiNFhiqt39i0lPKGUIkfyI4/a', '2025-05-13 01:48:00', 0, 0),
('U003', 'user3', '$2b$10$.xeyDmg6SzYkxVF4joycreg4ANiSfiNFhiqt39i0lPKGUIkfyI4/a', '2025-05-13 01:48:04', 0, 1),
('U004', 'user4', '$2b$10$.xeyDmg6SzYkxVF4joycreg4ANiSfiNFhiqt39i0lPKGUIkfyI4/a', '2025-05-21 01:48:07', 0, 1),
('U005', 'user5', '$2b$10$.xeyDmg6SzYkxVF4joycreg4ANiSfiNFhiqt39i0lPKGUIkfyI4/a', '2025-05-09 01:48:10', 0, 1);

-- --------------------------------------------------------

--
-- Table structure for table `reports`
--

DROP TABLE IF EXISTS `reports`;
CREATE TABLE IF NOT EXISTS `reports` (
  `report_id` varchar(36) NOT NULL,
  `report_type` varchar(255) DEFAULT NULL,
  `content` text,
  `remarks` text,
  `status` varchar(50) DEFAULT NULL,
  `created_dt` datetime DEFAULT CURRENT_TIMESTAMP,
  `officer_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`report_id`),
  KEY `officer_id` (`officer_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `report_refrences`
--

DROP TABLE IF EXISTS `report_refrences`;
CREATE TABLE IF NOT EXISTS `report_refrences` (
  `report_id` varchar(36) NOT NULL,
  `ref_id` varchar(36) NOT NULL,
  `ref_type` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`report_id`,`ref_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

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

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_id`, `name`, `email`, `nic`, `phone`, `address`, `created_dt`, `role`, `profile_pic`) VALUES
('U001', 'John Dave', 'john@gmail.com', '200220202220', '0771234567', 'ww', '2025-04-01 10:28:19', 'Crime OIC', 'https://randomuser.me/api/portraits/men/32.jpg'),
('U002', 'Kumara Perera', 'kumara@gmail.com', '200230303330', '0712345678', 'Maradana, Colombo 10', '2025-04-05 09:15:22', 'Sergeant', 'https://randomuser.me/api/portraits/men/33.jpg'),
('U003', 'Malini Fernando', 'malini@gmail.com', '200240404440', '0763456789', 'Kandy Road, Kurunegala', '2025-04-10 14:30:45', 'Sub Inspector', 'https://randomuser.me/api/portraits/women/32.jpg'),
('U004', 'Nimal Gunawardena', 'nimal@gmail.com', '200250505550', '0754567890', 'Temple Road, Matara', '2025-04-15 11:20:33', 'Sub Inspector', 'https://randomuser.me/api/portraits/men/39.jpg'),
('U005', 'Chamari Jayasuriya', 'chamari@gmail.com', '200260606660', '0775678901', 'Beach Road, Negombo', '2025-04-20 16:45:10', 'Sergeant', 'https://randomuser.me/api/portraits/women/36.jpg');

-- --------------------------------------------------------

--
-- Table structure for table `usersessions`
--

DROP TABLE IF EXISTS `usersessions`;
CREATE TABLE IF NOT EXISTS `usersessions` (
  `session_id` varchar(36) NOT NULL,
  `user_id` varchar(36) NOT NULL,
  `device_info` text NOT NULL,
  `login_time` datetime DEFAULT CURRENT_TIMESTAMP,
  `last_activity` datetime DEFAULT CURRENT_TIMESTAMP,
  `current_cookie` varchar(255) NOT NULL,
  PRIMARY KEY (`session_id`),
  KEY `user_id` (`user_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
