-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1:3306
-- Generation Time: Jun 09, 2025 at 04:50 PM
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
-- Table structure for table `attachments`
--

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

--
-- Dumping data for table `attachments`
--

INSERT INTO `attachments` (`attachment_id`, `evidence_id`, `file_name`, `file_path`, `file_type`, `file_size`, `uploaded_dt`, `uploaded_by`) VALUES
('ATT5946144173', 'EVD9490566249', 'Picture1.png', 'uploads/evidences/EVD9490566249/1749070128694-Picture1.png', 'image/png', 707647, '2025-06-05 02:18:48', 'U001'),
('ATT1900117477', 'EVD3611648521', 'Screenshot 2024-12-17 123958.png', 'uploads/evidences/EVD3611648521/1749070318853-Screenshot 2024-12-17 123958.png', 'image/png', 1974912, '2025-06-05 02:21:58', 'U001'),
('ATT5048223032', 'EVD3659665199', 'c (2).jpg', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\uploads\\evidences\\temp\\1749074340930-562180243.jpg', 'image/jpeg', 1893588, '2025-06-05 03:29:00', 'U001'),
('ATT8992556123', 'EVD3659665199', 'Firefly 20240618014052.png', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\uploads\\evidences\\temp\\1749074340937-496330478.png', 'image/png', 2134334, '2025-06-05 03:29:00', 'U001'),
('ATT7329641327', 'EVD3863004651', 'Screenshot 2024-12-17 123958.png', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749074729969-179889388.png', 'image/png', 1974912, '2025-06-05 03:35:29', 'U001'),
('ATT6424856450', 'EVD0518047356', 'Screenshot 2024-12-17 123958.png', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749376837880-153066247.png', 'image/png', 1974912, '2025-06-08 15:30:37', 'U001'),
('ATT2609819366', 'EVD2965193319', 'Picture1.png', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749384653442-481105643.png', 'image/png', 707647, '2025-06-08 17:40:53', 'U001'),
('ATT8582486088', 'EVD6746367243', 'Screenshot 2024-12-17 123958.png', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749465551795-805185580.png', 'image/png', 1974912, '2025-06-09 16:09:11', 'U001'),
('ATT9863735497', 'EVD5974300921', 'Picture1.png', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749472255603-790619285.png', 'image/png', 707647, '2025-06-09 18:00:55', 'U001');

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
('AUD1971762057', 'B7848159803', 'cases', 'C9999816989', 'status', 'oicrejected', 'UPDATE', 'U001', '2025-05-29 23:50:23'),
('AUD0265401225', 'B1120486543', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint.scascas', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD6798587685', 'B1120486543', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD1367127347', 'B1120486543', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 2', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD9916028311', 'B1120486543', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD5674066908', 'B1120486543', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdated2@example.com', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD6380996479', 'B1120486543', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main St', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD7029464849', 'B1120486543', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-31', 'UPDATE', 'U001', '2025-05-31 16:39:18'),
('AUD2167009224', 'B3864334508', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint.scascas', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD2311989584', 'B3864334508', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD0940497015', 'B3864334508', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 2', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD7162249779', 'B3864334508', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD7545261897', 'B3864334508', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdated2@example.com', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD6408048656', 'B3864334508', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main St', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD5426266117', 'B3864334508', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-30', 'UPDATE', 'U001', '2025-05-31 16:41:09'),
('AUD0724770388', 'B5746721563', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint.scascas', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD9836599204', 'B5746721563', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD1882357417', 'B5746721563', 'evidance_witnesses', 'EVD0425084493_900000000Vvv', 'name', 'Test User updated 2', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD2107762089', 'B5746721563', 'evidance_witnesses', 'EVD0425084493_900000000Vvv', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD5676228499', 'B5746721563', 'evidance_witnesses', 'EVD0425084493_900000000Vvv', 'email', 'testupdated2@example.com', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD6359275609', 'B5746721563', 'evidance_witnesses', 'EVD0425084493_900000000Vvv', 'address', '123 Main St', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD1886969822', 'B5746721563', 'evidance_witnesses', 'EVD0425084493_900000000Vvv', 'dob', '1999-12-30', 'UPDATE', 'U001', '2025-05-31 16:41:38'),
('AUD8297694984', 'B9114546160', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint.scascas', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD4341222430', 'B9114546160', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD4976548870', 'B9114546160', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 2', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD4255210741', 'B9114546160', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD0894794489', 'B9114546160', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdated2@example.com', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD5508054453', 'B9114546160', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stsssss', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD9266801433', 'B9114546160', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-29', 'UPDATE', 'U001', '2025-05-31 16:43:20'),
('AUD8889056109', 'B7133667276', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint.scascas', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD4229374198', 'B7133667276', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD5327178275', 'B7133667276', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 24', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD2140747098', 'B7133667276', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD9066433118', 'B7133667276', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdated2@example.com', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD3387730756', 'B7133667276', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stsssss', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD1197528392', 'B7133667276', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-29', 'UPDATE', 'U001', '2025-05-31 16:44:18'),
('AUD9918882821', 'B0985153099', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint.scascasccccccc', 'UPDATE', 'U001', '2025-05-31 19:34:42'),
('AUD7158127221', 'B0985153099', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 24 d', 'UPDATE', 'U001', '2025-05-31 19:34:42'),
('AUD5828188508', 'B0985153099', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567 78', 'UPDATE', 'U001', '2025-05-31 19:34:42'),
('AUD5374369228', 'B0985153099', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdateaad2@example.com', 'UPDATE', 'U001', '2025-05-31 19:34:42'),
('AUD4838111882', 'B0985153099', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stssssss', 'UPDATE', 'U001', '2025-05-31 19:34:42'),
('AUD9563078911', 'B0985153099', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-28', 'UPDATE', 'U001', '2025-05-31 19:34:42'),
('AUD0695631844', 'B6726825401', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD5731622200', 'B6726825401', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD2478487175', 'B6726825401', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 4', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD8878090747', 'B6726825401', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567 78', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD1978379406', 'B6726825401', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdateaad2@example.com', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD0498233871', 'B6726825401', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stss', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD7520929569', 'B6726825401', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-27', 'UPDATE', 'U001', '2025-05-31 19:38:36'),
('AUD1957890606', 'B3625629621', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD9280038491', 'B3625629621', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD5484786424', 'B3625629621', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 4', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD0993242825', 'B3625629621', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567 78', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD8903871136', 'B3625629621', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdateaad2@example.com', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD2914491519', 'B3625629621', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stss', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD6166241414', 'B3625629621', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-29', 'UPDATE', 'U001', '2025-05-31 19:38:49'),
('AUD1811643126', 'B4360214237', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint mm', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD6529682757', 'B4360214237', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD5394933239', 'B4360214237', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 24', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD8551996908', 'B4360214237', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD0261676713', 'B4360214237', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdated2@example.com', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD9576934769', 'B4360214237', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stsssss', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD9412918106', 'B4360214237', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-28', 'UPDATE', 'U001', '2025-05-31 19:45:38'),
('AUD6009311731', 'B3865107778', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD2028504352', 'B3865107778', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD6979010219', 'B3865107778', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 5', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD5220189117', 'B3865107778', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD1333091357', 'B3865107778', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdateaad2@example.com', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD5303293616', 'B3865107778', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stss', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD0043092542', 'B3865107778', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-28', 'UPDATE', 'U001', '2025-05-31 19:46:02'),
('AUD9840967991', 'B6981346851', 'complaints', 'CMP3591845754', 'description', 'This is a test complaintvv', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD5755274118', 'B6981346851', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD7406127253', 'B6981346851', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 5', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD3656385482', 'B6981346851', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD4915660162', 'B6981346851', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdateaad2@example.com', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD9579292337', 'B6981346851', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stss', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD2043881103', 'B6981346851', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-28', 'UPDATE', 'U001', '2025-05-31 19:46:29'),
('AUD1870196133', 'B1333057746', 'complaints', 'CMP3591845754', 'description', 'This is a test complaintvv', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD0388088245', 'B1333057746', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD0748738297', 'B1333057746', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 5', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD8624033657', 'B1333057746', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234567', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD5413182105', 'B1333057746', 'evidance_witnesses', 'EVD0425084493_900000000V', 'email', 'testupdateaad2@example.com', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD8454198307', 'B1333057746', 'evidance_witnesses', 'EVD0425084493_900000000V', 'address', '123 Main Stss', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD9097941788', 'B1333057746', 'evidance_witnesses', 'EVD0425084493_900000000V', 'dob', '1999-12-28', 'UPDATE', 'U001', '2025-05-31 19:46:35'),
('AUD7450856270', 'B2996118608', 'complaints', 'CMP3591845754', 'description', 'This is a test complaintb', 'UPDATE', 'U001', '2025-05-31 19:56:24'),
('AUD1486660443', 'B7013119764', 'evidance_witnesses', 'EVD0425084493_900000000V', 'name', 'Test User updated 8', 'UPDATE', 'U001', '2025-05-31 19:56:38'),
('AUD3815825031', 'B3064250778', 'complaints', 'CMP3591845754', 'description', 'This is a test complaint', 'UPDATE', 'U001', '2025-05-31 19:56:58'),
('AUD0706310559', 'B3064250778', 'evidance_witnesses', 'EVD0425084493_900000000V', 'phone', '0771234568', 'UPDATE', 'U001', '2025-05-31 19:56:58'),
('AUD6899901110', 'B3398382854', 'complaints', 'CMP3591845754', 'status', 'new', 'UPDATE', 'U001', '2025-05-31 20:50:21'),
('AUD4626840630', 'B9900933630', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 20:51:16'),
('AUD7924371477', 'B1420487981', 'complaints', 'CMP3591845754', 'status', 'closed', 'UPDATE', 'U001', '2025-05-31 20:55:22'),
('AUD4521818403', 'B5511315332', 'complaints', 'CMP3591845754', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 20:55:38'),
('AUD6265772823', 'B9049091457', 'complaints', 'CMP3538836277', 'status', 'viewed', 'UPDATE', 'U001', '2025-05-31 21:00:11'),
('AUD5028123907', 'B1711166407', 'complaints', 'CMP3538836277', 'status', 'closed', 'UPDATE', 'U001', '2025-05-31 21:07:23'),
('AUD7472114657', 'B1711166407', 'cases', 'C9999816989', 'status', 'oicrejected', 'UPDATE', 'U001', '2025-05-31 21:07:23'),
('AUD1728846399', 'B9155018132', 'cases', 'C9999816989', 'topic', 'test 2', 'INSERT', 'U003', '2025-05-31 21:08:15'),
('AUD1056828336', 'B9155018132', 'cases', 'C9999816989', 'status', 'inprogress', 'UPDATE', 'U003', '2025-05-31 21:08:15'),
('AUD1298562392', 'B9155018132', 'cases', 'C9999816989', 'started_dt', '2025-05-31T15:38:15.028Z', 'INSERT', 'U003', '2025-05-31 21:08:15'),
('AUD1208510569', 'B9155018132', 'cases', 'C9999816989', 'leader_id', 'U003', 'INSERT', 'U003', '2025-05-31 21:08:15'),
('AUD7625477299', 'B9155018132', 'complaints', 'CMP3538836277', 'status', 'viewed', 'UPDATE', 'U003', '2025-05-31 21:08:15'),
('AUD0260198896', 'B1355191546', 'cases', 'C9999816989', 'topic', 'test 2k', 'UPDATE', 'U001', '2025-06-02 09:49:25'),
('AUD2422443791', 'B1075719890', 'cases', 'C9999816989', 'topic', 'test 2kmmm', 'UPDATE', 'U001', '2025-06-02 09:49:50'),
('AUD8884586245', 'B9893675860', 'cases', 'C9999816989', 'leader_id', 'U002', 'UPDATE', 'U001', '2025-06-02 09:50:12'),
('AUD0376141349', 'B8182248842', 'cases', 'C9999816989', 'topic', 'test 2', 'UPDATE', 'U001', '2025-06-02 09:50:36'),
('AUD6531166433', 'B8182248842', 'cases', 'C9999816989', 'leader_id', 'U003', 'UPDATE', 'U001', '2025-06-02 09:50:36'),
('AUD4358378772', 'B8237208706', 'cases', 'C9999816989', 'topic', 'test 29', 'UPDATE', 'U001', '2025-06-02 09:50:53'),
('AUD7987967454', 'B4025349441', 'cases', 'C9999816989', 'topic', 'test 290', 'UPDATE', 'U001', '2025-06-02 09:51:10'),
('AUD4872516206', 'B4025349441', 'cases', 'C9999816989', 'leader_id', 'U002', 'UPDATE', 'U001', '2025-06-02 09:51:10'),
('AUD7993803515', 'B8492763534', 'cases', 'C9999816989', 'topic', 'test 2909', 'UPDATE', 'U001', '2025-06-02 09:53:49'),
('AUD6208323754', 'B2374447775', 'cases', 'C9999816989', 'leader_id', 'U003', 'UPDATE', 'U001', '2025-06-02 09:53:55'),
('AUD7990739923', 'B8856883650', 'cases', 'C9999816989', 'topic', 'test 2909m', 'UPDATE', 'U001', '2025-06-02 10:00:00'),
('AUD9127489065', 'B8856883650', 'cases', 'C9999816989', 'leader_id', 'U002', 'UPDATE', 'U001', '2025-06-02 10:00:00'),
('AUD3907510073', 'B5438884114', 'cases', 'C9999816989', 'topic', 'test 2909m m', 'UPDATE', 'U001', '2025-06-02 10:00:08'),
('AUD7884397340', 'B8563440297', 'evidance', 'EVD0640162873', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD3279324322', 'B8563440297', 'evidance', 'EVD0640162873', 'details', 'missing around 10 am', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD0766809627', 'B8563440297', 'evidance', 'EVD0640162873', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD9682360550', 'B8563440297', 'complaints', 'CMP2540564818', 'description', 'missing', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD9710307255', 'B8563440297', 'complaints', 'CMP2540564818', 'status', 'new', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD8182293019', 'B8563440297', 'complaints', 'CMP2540564818', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD5875203309', 'B8563440297', 'complaints', 'CMP2540564818', 'first_evidance_id', 'EVD0640162873', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD2012208050', 'B8563440297', 'evidance_witnesses', 'EVD0640162873_200220202220', 'nic', '200220202220', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD5910774705', 'B8563440297', 'evidance_witnesses', 'EVD0640162873_200220202220', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD1841166671', 'B8563440297', 'evidance_witnesses', 'EVD0640162873_200220202220', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD1267455331', 'B8563440297', 'evidance_witnesses', 'EVD0640162873_200220202220', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD6947110586', 'B8563440297', 'evidance_witnesses', 'EVD0640162873_200220202220', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD3682224526', 'B8563440297', 'evidance_witnesses', 'EVD0640162873_200220202220', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD7341707145', 'B8563440297', 'cases', 'C0227480329', 'case_type', 'Missing Person', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD7423797080', 'B8563440297', 'cases', 'C0227480329', 'status', 'oicnotreviewed', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD4964551305', 'B8563440297', 'cases', 'C0227480329', 'complain_id', 'CMP2540564818', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD9708229571', 'B8563440297', 'case_evidance', 'C0227480329_EVD0640162873', 'case_id', 'C0227480329', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD8058045254', 'B8563440297', 'case_evidance', 'C0227480329_EVD0640162873', 'evidence_id', 'EVD0640162873', 'INSERT', 'U001', '2025-06-02 10:01:42'),
('AUD0828301098', 'B5390006002', 'complaints', 'CMP2540564818', 'description', 'missing mnmmm', 'UPDATE', 'U001', '2025-06-02 10:05:21'),
('AUD5253887766', 'B9279285004', 'cases', 'C0227480329', 'topic', 'missing person 2', 'INSERT', 'U002', '2025-06-02 10:05:42'),
('AUD6276094668', 'B9279285004', 'cases', 'C0227480329', 'status', 'inprogress', 'UPDATE', 'U002', '2025-06-02 10:05:42'),
('AUD3781019775', 'B9279285004', 'cases', 'C0227480329', 'started_dt', '2025-06-02T04:35:42.066Z', 'INSERT', 'U002', '2025-06-02 10:05:42'),
('AUD8697867536', 'B9279285004', 'cases', 'C0227480329', 'leader_id', 'U002', 'INSERT', 'U002', '2025-06-02 10:05:42'),
('AUD9029522357', 'B9279285004', 'complaints', 'CMP2540564818', 'status', 'viewed', 'UPDATE', 'U002', '2025-06-02 10:05:42'),
('AUD5755890841', 'B7987699923', 'cases', 'C0227480329', 'topic', '', 'UPDATE', 'U001', '2025-06-02 10:10:29'),
('AUD8092510648', 'B6587220390', 'cases', 'C0227480329', 'topic', 'l', 'UPDATE', 'U001', '2025-06-02 10:11:49'),
('AUD1123022817', 'B0091122863', 'cases', 'C0227480329', 'topic', 'test topic', 'UPDATE', 'U001', '2025-06-02 10:12:10'),
('AUD8598802982', 'B1017595588', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratnmmm', 'UPDATE', 'U001', '2025-06-02 10:20:38'),
('AUD9842498654', 'B4230658609', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratne', 'UPDATE', 'U001', '2025-06-02 10:21:06'),
('AUD7115574039', 'B4230658609', 'CriminalRecord', 'CRIM004', 'phone', '0766544322', 'UPDATE', 'U001', '2025-06-02 10:21:06'),
('AUD9845193260', 'B4230658609', 'CriminalRecord', 'CRIM004', 'address', '12B, Sea Road, Negomb', 'UPDATE', 'U001', '2025-06-02 10:21:06'),
('AUD4944046981', 'B4230658609', 'CriminalRecord', 'CRIM004', 'fingerprint_hash', '0123456789fedcbaac', 'UPDATE', 'U001', '2025-06-02 10:21:06'),
('AUD3252724881', 'B5096119718', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratn', 'UPDATE', 'U001', '2025-06-02 10:24:42'),
('AUD5396727851', 'B7626896358', 'CriminalRecord', 'CRIM004', 'address', '12B, Sea Road, Negombo', 'UPDATE', 'U001', '2025-06-02 10:25:22'),
('AUD9930490692', 'B8277062314', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratne', 'UPDATE', 'U001', '2025-06-02 10:27:30'),
('AUD7914310382', 'B9709472463', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratnee', 'UPDATE', 'U001', '2025-06-02 10:30:35'),
('AUD9393517288', 'B4237327983', 'cases', 'C9999816989', 'topic', 'test 2', 'UPDATE', 'U001', '2025-06-02 10:32:32'),
('AUD3093049411', 'B3439577538', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratne', 'UPDATE', 'U001', '2025-06-02 10:33:59'),
('AUD1489657182', 'B4260091158', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratnee', 'UPDATE', 'U001', '2025-06-02 10:35:55'),
('AUD0847596911', 'B8799938757', 'CriminalRecord', 'CRIM004', 'name', 'Asanka Wijeratne', 'UPDATE', 'U001', '2025-06-02 10:37:17'),
('AUD9856681487', 'B8006073115', 'users', 'U002', 'address', 'Maradana, Colombo 1', 'UPDATE', 'U001', '2025-06-02 11:00:36'),
('AUD7847500271', 'B4308267081', 'users', 'U002', 'role', 'Forensic Officer', 'UPDATE', 'U001', '2025-06-02 11:01:10'),
('AUD5099370380', 'B6281931430', 'users', 'U002', 'address', 'Maradana, Colombo 10', 'UPDATE', 'U001', '2025-06-02 11:01:33'),
('AUD4081845628', 'B6281931430', 'users', 'U002', 'role', 'Sub Inspector', 'UPDATE', 'U001', '2025-06-02 11:01:33'),
('AUD2726707803', 'B0507682535', 'login', 'U002', 'account_locked', '1', 'UPDATE', 'U001', '2025-06-02 11:09:36'),
('AUD5239419525', 'B3925417872', 'login', 'U002', 'account_locked', '0', 'UPDATE', 'U001', '2025-06-02 11:09:50'),
('AUD8939518568', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'crime_type', 'Theft', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD2053768228', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'status', 'Alleged', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD3592731411', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'risk_score', '25', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD1428578253', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'reported_dt', '2025-06-04T11:37', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD5666381038', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'happened_dt', '2025-06-12T11:37', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD0517632630', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'criminal_id', 'CRIM001', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD7568722206', 'B1832454364', 'crimeoffence', 'OFF4725497606', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-02 11:38:24'),
('AUD6522890162', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'crime_type', 'Assault', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD8492781607', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'status', 'Alleged', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD3384618951', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'risk_score', '60', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD5316541231', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'reported_dt', '2025-06-05T11:57', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD3646321910', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'happened_dt', '2025-06-11T11:57', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD0130889220', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'criminal_id', 'CRIM001', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD3468437226', 'B5925245283', 'crimeoffence', 'OFF9276946595', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-02 11:57:36'),
('AUD9898159107', 'B4937720475', 'evidance', 'EVD2876307032', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD2430078822', 'B4937720475', 'evidance', 'EVD2876307032', 'details', 'descritpion 23', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD6124520746', 'B4937720475', 'evidance', 'EVD2876307032', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD5545723657', 'B4937720475', 'complaints', 'CMP0001774014', 'description', 'descritpion 23', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD8392541147', 'B4937720475', 'complaints', 'CMP0001774014', 'status', 'new', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD6860383695', 'B4937720475', 'complaints', 'CMP0001774014', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD2857790218', 'B4937720475', 'complaints', 'CMP0001774014', 'first_evidance_id', 'EVD2876307032', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD9891709218', 'B4937720475', 'evidance_witnesses', 'EVD2876307032_198002700081', 'nic', '198002700081', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD3990640427', 'B4937720475', 'evidance_witnesses', 'EVD2876307032_198002700081', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD5848997899', 'B4937720475', 'evidance_witnesses', 'EVD2876307032_198002700081', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD4559952650', 'B4937720475', 'evidance_witnesses', 'EVD2876307032_198002700081', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD5340817467', 'B4937720475', 'evidance_witnesses', 'EVD2876307032_198002700081', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD9525822474', 'B4937720475', 'evidance_witnesses', 'EVD2876307032_198002700081', 'dob', '2004-02-20', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD2457735862', 'B4937720475', 'cases', 'C1179593017', 'case_type', 'Criminal', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD5088148487', 'B4937720475', 'cases', 'C1179593017', 'status', 'oicnotreviewed', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD1724583583', 'B4937720475', 'cases', 'C1179593017', 'complain_id', 'CMP0001774014', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD3208708745', 'B4937720475', 'case_evidance', 'C1179593017_EVD2876307032', 'case_id', 'C1179593017', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD4495720924', 'B4937720475', 'case_evidance', 'C1179593017_EVD2876307032', 'evidence_id', 'EVD2876307032', 'INSERT', 'U001', '2025-06-02 13:05:43'),
('AUD3676089780', 'B6886808357', 'cases', 'C1179593017', 'topic', 'sssssssss', 'INSERT', 'U003', '2025-06-02 13:06:27'),
('AUD9808392623', 'B6886808357', 'cases', 'C1179593017', 'status', 'inprogress', 'UPDATE', 'U003', '2025-06-02 13:06:27'),
('AUD3353816200', 'B6886808357', 'cases', 'C1179593017', 'started_dt', '2025-06-02T07:36:27.833Z', 'INSERT', 'U003', '2025-06-02 13:06:27'),
('AUD7375643337', 'B6886808357', 'cases', 'C1179593017', 'leader_id', 'U003', 'INSERT', 'U003', '2025-06-02 13:06:27'),
('AUD5471270555', 'B6886808357', 'complaints', 'CMP0001774014', 'status', 'viewed', 'UPDATE', 'U003', '2025-06-02 13:06:27'),
('AUD9975722422', 'B0569618038', 'cases', 'C1179593017', 'leader_id', 'U005', 'UPDATE', 'U001', '2025-06-02 13:08:08'),
('AUD5285138224', 'B2487586505', 'cases', 'C1179593017', 'leader_id', 'U003', 'UPDATE', 'U001', '2025-06-02 13:09:54'),
('AUD9614939038', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'crime_type', 'Manslaughter', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD5423803507', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'status', 'Alleged', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD1212546098', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'risk_score', '85', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD5526948090', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'reported_dt', '2025-06-11T13:29', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD0818342596', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'happened_dt', '2025-06-04T13:30', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD5145651224', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'criminal_id', 'CRIM001', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD3226269212', 'B8467333999', 'crimeoffence', 'OFF3547889430', 'case_id', 'C0227480329', 'INSERT', 'U001', '2025-06-02 13:30:08'),
('AUD6069593672', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'crime_type', 'Kidnapping', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD5412337693', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'status', 'Alleged', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD6736485648', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'risk_score', '85', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD3280639001', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'reported_dt', '2025-06-19T13:39', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD9468269412', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'happened_dt', '2025-06-21T13:39', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD1407757427', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'criminal_id', 'CRIM004', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD9176450057', 'B3276934040', 'crimeoffence', 'OFF9865937223', 'case_id', 'C004', 'INSERT', 'U001', '2025-06-02 13:39:37'),
('AUD7440330457', 'B6775314463', 'criminalrecord', 'CRIM6104702777', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-02 15:04:16'),
('AUD3343636354', 'B6775314463', 'criminalrecord', 'CRIM6104702777', 'nic', '200220202220', 'INSERT', 'U001', '2025-06-02 15:04:16'),
('AUD8448201658', 'B6775314463', 'criminalrecord', 'CRIM6104702777', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-02 15:04:16'),
('AUD1586713368', 'B6775314463', 'criminalrecord', 'CRIM6104702777', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-02 15:04:16'),
('AUD4044931639', 'B6775314463', 'criminalrecord', 'CRIM6104702777', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-02 15:04:16'),
('AUD2686430270', 'B6775314463', 'criminalrecord', 'CRIM6104702777', 'fingerprint_hash', '', 'INSERT', 'U001', '2025-06-02 15:04:16'),
('AUD5029824875', 'B7857915675', 'CriminalRecord', 'CRIM6104702777', 'name', 'Ghim Shasinth', 'UPDATE', 'U001', '2025-06-02 15:08:45'),
('AUD1160356127', 'B8498044686', 'CriminalRecord', 'CRIM6104702777', 'name', 'Ghim Shasintha', 'UPDATE', 'U001', '2025-06-02 15:08:54'),
('AUD2864843953', 'B7102475596', 'criminalrecord', 'CRIM004', 'nic', '199233445567', 'UPDATE', 'U001', '2025-06-02 15:10:31'),
('AUD3870676306', 'B7102475596', 'criminalrecord', 'CRIM004', 'phone', '0766544323', 'UPDATE', 'U001', '2025-06-02 15:10:31'),
('AUD3135004292', 'B8371275644', 'criminalrecord', 'CRIM7006881266', 'name', 'Ghim', 'INSERT', 'U001', '2025-06-02 15:11:19'),
('AUD8838959938', 'B8371275644', 'criminalrecord', 'CRIM7006881266', 'nic', '200220202260', 'INSERT', 'U001', '2025-06-02 15:11:19'),
('AUD1483995430', 'B8371275644', 'criminalrecord', 'CRIM7006881266', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-02 15:11:19'),
('AUD3798224509', 'B8371275644', 'criminalrecord', 'CRIM7006881266', 'address', '12B, Sea Road, Negombo', 'INSERT', 'U001', '2025-06-02 15:11:19'),
('AUD3325126254', 'B8371275644', 'criminalrecord', 'CRIM7006881266', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-02 15:11:19'),
('AUD7614704327', 'B8371275644', 'criminalrecord', 'CRIM7006881266', 'fingerprint_hash', '0123456789fedcbaacbbb', 'INSERT', 'U001', '2025-06-02 15:11:19'),
('AUD8422098103', 'B7769324368', 'criminalrecord', 'CRIM8854603211', 'name', 'Shasintha', 'INSERT', 'U001', '2025-06-02 15:13:35'),
('AUD0519544149', 'B7769324368', 'criminalrecord', 'CRIM8854603211', 'nic', '200220202261', 'INSERT', 'U001', '2025-06-02 15:13:35'),
('AUD7372323751', 'B7769324368', 'criminalrecord', 'CRIM8854603211', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-02 15:13:35'),
('AUD7320780803', 'B7769324368', 'criminalrecord', 'CRIM8854603211', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-02 15:13:35'),
('AUD9168636712', 'B7769324368', 'criminalrecord', 'CRIM8854603211', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-02 15:13:35'),
('AUD4055814723', 'B4759804474', 'criminalrecord', 'CRIM8976209619', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-02 16:29:04'),
('AUD4159468302', 'B4759804474', 'criminalrecord', 'CRIM8976209619', 'nic', '200220202226', 'INSERT', 'U001', '2025-06-02 16:29:04'),
('AUD9504343266', 'B4759804474', 'criminalrecord', 'CRIM8976209619', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-02 16:29:04'),
('AUD2629831854', 'B4759804474', 'criminalrecord', 'CRIM8976209619', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-02 16:29:04'),
('AUD7402283015', 'B4759804474', 'criminalrecord', 'CRIM8976209619', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-02 16:29:04'),
('AUD3528043571', 'B1142554304', 'crimeoffence', 'OFF3547889430', 'crime_type', 'Bribery', 'UPDATE', 'U001', '2025-06-02 20:38:28'),
('AUD7216070889', 'B1142554304', 'crimeoffence', 'OFF3547889430', 'risk_score', '75', 'UPDATE', 'U001', '2025-06-02 20:38:28'),
('AUD5792204188', 'B1518103797', 'crimeoffence', 'OFF3547889430', 'crime_type', 'Blackmail', 'UPDATE', 'U001', '2025-06-02 20:39:07'),
('AUD6603628525', 'B1518103797', 'crimeoffence', 'OFF3547889430', 'status', 'Convicted', 'UPDATE', 'U001', '2025-06-02 20:39:07'),
('AUD5204986000', 'B1518103797', 'crimeoffence', 'OFF3547889430', 'risk_score', '73', 'UPDATE', 'U001', '2025-06-02 20:39:07'),
('AUD7108709336', 'B1518103797', 'crimeoffence', 'OFF3547889430', 'reported_dt', '2025-06-12T07:59', 'UPDATE', 'U001', '2025-06-02 20:39:07'),
('AUD7479945461', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'crime_type', 'Domestic Violence', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD3907857146', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'status', 'Alleged', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD3931524454', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'risk_score', '36', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD8479438842', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'reported_dt', '2025-06-28T20:50', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD1881495181', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'happened_dt', '2025-06-01T20:50', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD1177315670', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'criminal_id', 'CRIM003', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD1220821371', 'B2526174115', 'crimeoffence', 'OFF9662240753', 'case_id', 'C005', 'INSERT', 'U001', '2025-06-02 21:07:04'),
('AUD6503976125', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'crime_type', 'Armed Robbery', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD9117785842', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'status', 'Alleged', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD4256500169', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'risk_score', '88', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD0474168703', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'reported_dt', '2025-06-14T00:01', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD8208881257', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'happened_dt', '2025-06-04T00:01', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD0152156194', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'criminal_id', 'CRIM004', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD9403726018', 'B3319460702', 'crimeoffence', 'OFF4368558494', 'case_id', 'C9818234044', 'INSERT', 'U001', '2025-06-03 00:01:07'),
('AUD7106299163', 'B2855259210', 'cases', 'C1179593017', 'leader_id', 'U002', 'UPDATE', 'U001', '2025-06-03 11:36:13'),
('AUD1768328823', 'B1391316500', 'cases', 'C1179593017', 'leader_id', 'U003', 'UPDATE', 'U001', '2025-06-03 11:38:03'),
('AUD3958476395', 'B6870249525', 'investigation', 'INV4051508597', 'topic', 'Looking for fingerprints', 'INSERT', 'U001', '2025-06-03 11:50:14'),
('AUD7787168090', 'B6870249525', 'investigation', 'INV4051508597', 'location', 'galle main branch', 'INSERT', 'U001', '2025-06-03 11:50:14'),
('AUD7070694077', 'B6870249525', 'investigation', 'INV4051508597', 'status', 'inprogress', 'INSERT', 'U001', '2025-06-03 11:50:14'),
('AUD3773261396', 'B6870249525', 'investigation', 'INV4051508597', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-03 11:50:14'),
('AUD2895990450', 'B7207835270', 'investigation', 'INV1840539113', 'topic', 'Looking for fingerprints 2', 'INSERT', 'U001', '2025-06-03 11:56:31'),
('AUD8661807994', 'B7207835270', 'investigation', 'INV1840539113', 'location', 'galle 2', 'INSERT', 'U001', '2025-06-03 11:56:31'),
('AUD0525626665', 'B7207835270', 'investigation', 'INV1840539113', 'status', 'inprogress', 'INSERT', 'U001', '2025-06-03 11:56:31'),
('AUD6853721736', 'B7207835270', 'investigation', 'INV1840539113', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-03 11:56:31'),
('AUD3469170307', 'B7207835270', 'investigation_officer', 'INV1840539113_U002', 'officer_id', 'U002', 'INSERT', 'U001', '2025-06-03 11:56:31'),
('AUD0259345496', 'B7979686880', 'investigation_officer', 'INV4051508597_U002', 'officer_id', 'U002', 'DELETE', 'U001', '2025-06-03 12:32:14'),
('AUD0260309253', 'B2289442943', 'investigation_officer', 'INV4051508597_U003', 'officer_id', 'U003', 'DELETE', 'U001', '2025-06-03 12:33:30'),
('AUD4123894185', 'B2647554278', 'investigation_officer', 'INV4051508597_U002', 'officer_id', 'U002', 'INSERT', 'U001', '2025-06-03 12:33:37'),
('AUD6007776175', 'B1154948732', 'investigation_officer', 'INV4051508597_U003', 'officer_id', 'U003', 'INSERT', 'U001', '2025-06-03 12:33:45'),
('AUD1946770660', 'B2495767752', 'investigation', 'INV4051508597', 'topic', 'Looking for fingerprintsss', 'UPDATE', 'U001', '2025-06-03 12:41:38'),
('AUD6929957256', 'B9515134764', 'evidance', 'EVD2426255748', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD3791033196', 'B9515134764', 'evidance', 'EVD2426255748', 'details', 'details 1', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD5972714761', 'B9515134764', 'evidance', 'EVD2426255748', 'collected_dt', '2025-06-02 21:26:00', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD7177565462', 'B9515134764', 'evidance', 'EVD2426255748', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD3962840187', 'B9515134764', 'evidance', 'EVD2426255748', 'location', 'Galle 01', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD6946036085', 'B9515134764', 'evidance', 'EVD2426255748', 'investigation_id', 'INV1840539113', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD7949175983', 'B9515134764', 'case_evidance', 'C002_EVD2426255748', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD4254760845', 'B9515134764', 'case_evidance', 'C002_EVD2426255748', 'evidence_id', 'EVD2426255748', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD6706134137', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_200220202220', 'nic', '200220202220', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD8611947424', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_200220202220', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD0203202305', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_200220202220', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD9533899041', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_200220202220', 'email', 'imeshm@gmail.com', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD7749084491', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_200220202220', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD2700815756', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_200220202220', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD6745107397', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_300330303330', 'nic', '300330303330', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD6072559892', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_300330303330', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD4244850107', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_300330303330', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD6964481200', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_300330303330', 'email', 'imesh@gmail.com', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD9092661394', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_300330303330', 'address', 'Hiyare galle, 8', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD4588874801', 'B9515134764', 'evidance_witnesses', 'EVD2426255748_300330303330', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-03 20:28:41'),
('AUD5164383693', 'B2080431680', 'evidance', 'EVD7193972668', 'type', 'Fingerprint', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD8809051890', 'B2080431680', 'evidance', 'EVD7193972668', 'details', 'evidance 02', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD6789740065', 'B2080431680', 'evidance', 'EVD7193972668', 'collected_dt', '2025-06-03 20:49:00', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD0273012270', 'B2080431680', 'evidance', 'EVD7193972668', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD9688101202', 'B2080431680', 'evidance', 'EVD7193972668', 'location', 'galle 09', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD8093657725', 'B2080431680', 'case_evidance', 'C1179593017_EVD7193972668', 'case_id', 'C1179593017', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD2611916614', 'B2080431680', 'case_evidance', 'C1179593017_EVD7193972668', 'evidence_id', 'EVD7193972668', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD3547435809', 'B2080431680', 'evidance_witnesses', 'EVD7193972668_300330303330', 'nic', '300330303330', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD7201394589', 'B2080431680', 'evidance_witnesses', 'EVD7193972668_300330303330', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD5889374559', 'B2080431680', 'evidance_witnesses', 'EVD7193972668_300330303330', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD0826522389', 'B2080431680', 'evidance_witnesses', 'EVD7193972668_300330303330', 'email', 'imesh@gmail.com', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD4350439220', 'B2080431680', 'evidance_witnesses', 'EVD7193972668_300330303330', 'address', 'Hiyare galle 01', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD3868610977', 'B2080431680', 'evidance_witnesses', 'EVD7193972668_300330303330', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-03 20:50:12'),
('AUD5207339147', 'B2693004206', 'evidance', 'EVD2426255748', 'type', 'Written Statement', 'UPDATE', 'U001', '2025-06-05 00:40:42'),
('AUD1843364157', 'B2693004206', 'evidance', 'EVD2426255748', 'collected_dt', '2025-06-02 15:56', 'UPDATE', 'U001', '2025-06-05 00:40:42'),
('AUD4597205452', 'B1684622174', 'evidance', 'EVD2426255748', 'type', 'Fingerprint', 'UPDATE', 'U001', '2025-06-05 00:40:55'),
('AUD2218258857', 'B1684622174', 'evidance', 'EVD2426255748', 'collected_dt', '2025-06-02 10:26', 'UPDATE', 'U001', '2025-06-05 00:40:55'),
('AUD9982702786', 'B8002211459', 'evidance', 'EVD2426255748', 'collected_dt', '2025-06-02 04:56', 'UPDATE', 'U001', '2025-06-05 00:44:18'),
('AUD8301674180', 'B1261675446', 'evidance', 'EVD2426255748', 'collected_dt', '2025-06-01 23:26', 'UPDATE', 'U001', '2025-06-05 00:44:39'),
('AUD7148321357', 'B9375743888', 'evidance', 'EVD7193972668', 'collected_dt', '2025-06-03 15:19', 'UPDATE', 'U001', '2025-06-05 00:45:01'),
('AUD4565985627', 'B5985350458', 'evidance', 'EVD7193972668', 'collected_dt', '2025-06-03 09:49', 'UPDATE', 'U001', '2025-06-05 00:46:20'),
('AUD0696933347', 'B4591521733', 'evidance', 'EVD7193972668', 'collected_dt', '2025-06-03 04:19', 'UPDATE', 'U001', '2025-06-05 00:46:27'),
('AUD1232542199', 'B9905028028', 'evidance', 'EVD7193972668', 'collected_dt', '2025-06-02 22:49', 'UPDATE', 'U001', '2025-06-05 00:48:21'),
('AUD7421438587', 'B9645081311', 'evidance', 'EVD7193972668', 'details', 'evidance 03', 'UPDATE', 'U001', '2025-06-05 00:51:54'),
('AUD2625443737', 'B5776952817', 'cases', 'C1179593017', 'topic', 's case', 'UPDATE', 'U001', '2025-06-05 01:40:04'),
('AUD3092627584', 'B8462362393', 'evidance', 'EVD6060011725', 'type', 'CCTV Recording', 'INSERT', 'U001', '2025-06-05 02:17:39'),
('AUD1517037979', 'B8462362393', 'evidance', 'EVD6060011725', 'details', 'description 1', 'INSERT', 'U001', '2025-06-05 02:17:39'),
('AUD1449623465', 'B8462362393', 'evidance', 'EVD6060011725', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-05 02:17:39'),
('AUD2917486982', 'B6413781414', 'evidance', 'EVD9490566249', 'type', 'CCTV Recording', 'INSERT', 'U001', '2025-06-05 02:18:48'),
('AUD2210207982', 'B6413781414', 'evidance', 'EVD9490566249', 'details', 'description 002', 'INSERT', 'U001', '2025-06-05 02:18:48'),
('AUD7974005630', 'B6413781414', 'evidance', 'EVD9490566249', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-05 02:18:48'),
('AUD8788012360', 'B6413781414', 'attachments', 'ATT5946144173', 'file_name', 'Picture1.png', 'INSERT', 'U001', '2025-06-05 02:18:48'),
('AUD6473387846', 'B8587392228', 'evidance', 'EVD3611648521', 'type', 'Photograph', 'INSERT', 'U001', '2025-06-05 02:21:58'),
('AUD2643795301', 'B8587392228', 'evidance', 'EVD3611648521', 'details', 'descriptipn', 'INSERT', 'U001', '2025-06-05 02:21:58'),
('AUD2276369167', 'B8587392228', 'evidance', 'EVD3611648521', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-05 02:21:58'),
('AUD1340259740', 'B8587392228', 'attachments', 'ATT1900117477', 'file_name', 'Screenshot 2024-12-17 123958.png', 'INSERT', 'U001', '2025-06-05 02:21:58'),
('AUD0026625912', 'B6265044868', 'evidance', 'EVD3611648521', 'details', 'descriptipnv', 'UPDATE', 'U001', '2025-06-05 03:12:09'),
('AUD3514443231', 'B0905574584', 'evidance', 'EVD9059560651', 'type', 'Video Footage', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD0734640788', 'B0905574584', 'evidance', 'EVD9059560651', 'details', 'description1', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD9426963005', 'B0905574584', 'evidance', 'EVD9059560651', 'collected_dt', '2025-06-04 21:51:58', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD2166691817', 'B0905574584', 'evidance', 'EVD9059560651', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD3525806201', 'B0905574584', 'evidance', 'EVD9059560651', 'location', 'galle 09', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD8954066671', 'B0905574584', 'case_evidance', 'C9818234044_EVD9059560651', 'case_id', 'C9818234044', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD9189448749', 'B0905574584', 'case_evidance', 'C9818234044_EVD9059560651', 'evidence_id', 'EVD9059560651', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD8791665952', 'B0905574584', 'evidance_witnesses', 'EVD9059560651_300330303330', 'nic', '300330303330', 'INSERT', 'U001', '2025-06-05 03:21:58');
INSERT INTO `audit_log` (`audit_id`, `batch_id`, `table_name`, `record_id`, `field_name`, `value`, `action_type`, `changed_by`, `changed_at`) VALUES
('AUD7720935119', 'B0905574584', 'evidance_witnesses', 'EVD9059560651_300330303330', 'name', 'Asanka Wijeratnee', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD6326364899', 'B0905574584', 'evidance_witnesses', 'EVD9059560651_300330303330', 'phone', '0771234568', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD6673677929', 'B0905574584', 'evidance_witnesses', 'EVD9059560651_300330303330', 'email', 'usefortemplokan78@hotmail.com', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD2238581415', 'B0905574584', 'evidance_witnesses', 'EVD9059560651_300330303330', 'address', 'Hiyare galle 01', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD4763736624', 'B0905574584', 'evidance_witnesses', 'EVD9059560651_300330303330', 'dob', '2020-02-02', 'INSERT', 'U001', '2025-06-05 03:21:58'),
('AUD7846746071', 'B7109040726', 'evidance', 'EVD3659665199', 'type', 'DNA Sample', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD5708089754', 'B7109040726', 'evidance', 'EVD3659665199', 'details', 'dna description 1', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD5077881641', 'B7109040726', 'evidance', 'EVD3659665199', 'collected_dt', '2025-06-04 21:59:00', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD9858195704', 'B7109040726', 'evidance', 'EVD3659665199', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD2681449917', 'B7109040726', 'evidance', 'EVD3659665199', 'location', 'galle 09', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD0768564545', 'B7109040726', 'evidance', 'EVD3659665199', 'investigation_id', 'INV1840539113', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD4583279054', 'B7109040726', 'attachments', 'ATT5048223032', 'file_name', 'c (2).jpg', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD6631384860', 'B7109040726', 'attachments', 'ATT5048223032', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\uploads\\evidences\\temp\\1749074340930-562180243.jpg', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD9671122036', 'B7109040726', 'attachments', 'ATT5048223032', 'file_type', 'image/jpeg', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD3509671723', 'B7109040726', 'attachments', 'ATT5048223032', 'file_size', '1893588', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD4134332871', 'B7109040726', 'attachments', 'ATT5048223032', 'evidence_id', 'EVD3659665199', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD4548884949', 'B7109040726', 'attachments', 'ATT5048223032', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD1537995613', 'B7109040726', 'attachments', 'ATT8992556123', 'file_name', 'Firefly 20240618014052.png', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD4027312045', 'B7109040726', 'attachments', 'ATT8992556123', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\uploads\\evidences\\temp\\1749074340937-496330478.png', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD6529470567', 'B7109040726', 'attachments', 'ATT8992556123', 'file_type', 'image/png', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD8810392775', 'B7109040726', 'attachments', 'ATT8992556123', 'file_size', '2134334', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD9431039950', 'B7109040726', 'attachments', 'ATT8992556123', 'evidence_id', 'EVD3659665199', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD8985952096', 'B7109040726', 'attachments', 'ATT8992556123', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD3995267679', 'B7109040726', 'case_evidance', 'C002_EVD3659665199', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD5715177143', 'B7109040726', 'case_evidance', 'C002_EVD3659665199', 'evidence_id', 'EVD3659665199', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD9953569223', 'B7109040726', 'evidance_witnesses', 'EVD3659665199_202202022202', 'nic', '202202022202', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD0384636397', 'B7109040726', 'evidance_witnesses', 'EVD3659665199_202202022202', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD6991986361', 'B7109040726', 'evidance_witnesses', 'EVD3659665199_202202022202', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD8462185131', 'B7109040726', 'evidance_witnesses', 'EVD3659665199_202202022202', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD4595741182', 'B7109040726', 'evidance_witnesses', 'EVD3659665199_202202022202', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD0844682122', 'B7109040726', 'evidance_witnesses', 'EVD3659665199_202202022202', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-05 03:29:00'),
('AUD5326601430', 'B0655674171', 'evidance', 'EVD3863004651', 'type', 'Photograph', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD7939285006', 'B0655674171', 'evidance', 'EVD3863004651', 'details', 'deshjgksdfs', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD0601892825', 'B0655674171', 'evidance', 'EVD3863004651', 'collected_dt', '2025-06-04 22:05:29', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD9343445503', 'B0655674171', 'evidance', 'EVD3863004651', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD1708580012', 'B0655674171', 'evidance', 'EVD3863004651', 'location', 'galle 09', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD0395608910', 'B0655674171', 'attachments', 'ATT7329641327', 'file_name', 'Screenshot 2024-12-17 123958.png', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD6620854776', 'B0655674171', 'attachments', 'ATT7329641327', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749074729969-179889388.png', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD0156660859', 'B0655674171', 'attachments', 'ATT7329641327', 'file_type', 'image/png', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD0271844470', 'B0655674171', 'attachments', 'ATT7329641327', 'file_size', '1974912', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD8100237611', 'B0655674171', 'attachments', 'ATT7329641327', 'evidence_id', 'EVD3863004651', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD4607686681', 'B0655674171', 'attachments', 'ATT7329641327', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD0613561519', 'B0655674171', 'case_evidance', 'C9818234044_EVD3863004651', 'case_id', 'C9818234044', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD5527387819', 'B0655674171', 'case_evidance', 'C9818234044_EVD3863004651', 'evidence_id', 'EVD3863004651', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD2755504570', 'B0655674171', 'evidance_witnesses', 'EVD3863004651_202202022202', 'nic', '202202022202', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD5684020940', 'B0655674171', 'evidance_witnesses', 'EVD3863004651_202202022202', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD4035454617', 'B0655674171', 'evidance_witnesses', 'EVD3863004651_202202022202', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD6504975931', 'B0655674171', 'evidance_witnesses', 'EVD3863004651_202202022202', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD2309596514', 'B0655674171', 'evidance_witnesses', 'EVD3863004651_202202022202', 'address', 'Hiyare East, Hiyare', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD5939786460', 'B0655674171', 'evidance_witnesses', 'EVD3863004651_202202022202', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-05 03:35:29'),
('AUD6230821574', 'B1670589972', 'crimeoffence', 'OFF9865937223', 'crime_type', 'Armed Robbery', 'UPDATE', 'U001', '2025-06-06 13:17:59'),
('AUD6031310777', 'B1670589972', 'crimeoffence', 'OFF9865937223', 'risk_score', '88', 'UPDATE', 'U001', '2025-06-06 13:17:59'),
('AUD2745731192', 'B1670589972', 'crimeoffence', 'OFF9865937223', 'reported_dt', '2025-06-27T08:09', 'UPDATE', 'U001', '2025-06-06 13:17:59'),
('AUD7063291360', 'B1810857699', 'evidance', 'EVD3863004651', 'type', 'CCTV Recording', 'UPDATE', 'U001', '2025-06-08 12:04:40'),
('AUD9356658282', 'B5699170509', 'evidance', 'EVD0518047356', 'type', 'Fingerprint', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD8136050234', 'B5699170509', 'evidance', 'EVD0518047356', 'details', 'yyyyyyyyyyyyyy', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD5309509896', 'B5699170509', 'evidance', 'EVD0518047356', 'collected_dt', '2025-06-08 10:00:37', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD9135195903', 'B5699170509', 'evidance', 'EVD0518047356', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD8802438450', 'B5699170509', 'evidance', 'EVD0518047356', 'investigation_id', 'INV4051508597', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD1077944129', 'B5699170509', 'attachments', 'ATT6424856450', 'file_name', 'Screenshot 2024-12-17 123958.png', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD2917840110', 'B5699170509', 'attachments', 'ATT6424856450', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749376837880-153066247.png', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD6573054759', 'B5699170509', 'attachments', 'ATT6424856450', 'file_type', 'image/png', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD3115884872', 'B5699170509', 'attachments', 'ATT6424856450', 'file_size', '1974912', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD2595976171', 'B5699170509', 'attachments', 'ATT6424856450', 'evidence_id', 'EVD0518047356', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD7845147575', 'B5699170509', 'attachments', 'ATT6424856450', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD7670812974', 'B5699170509', 'case_evidance', 'C002_EVD0518047356', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD9299396139', 'B5699170509', 'case_evidance', 'C002_EVD0518047356', 'evidence_id', 'EVD0518047356', 'INSERT', 'U001', '2025-06-08 15:30:37'),
('AUD8840782050', 'B1266427117', 'evidance', 'EVD2965193319', 'type', 'Photograph', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD1039584549', 'B1266427117', 'evidance', 'EVD2965193319', 'details', 'hhhhhhhhhh', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD0186407547', 'B1266427117', 'evidance', 'EVD2965193319', 'collected_dt', '2025-06-08 12:10:53', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD0063598304', 'B1266427117', 'evidance', 'EVD2965193319', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD8839133862', 'B1266427117', 'evidance', 'EVD2965193319', 'investigation_id', 'INV1840539113', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD6164321294', 'B1266427117', 'attachments', 'ATT2609819366', 'file_name', 'Picture1.png', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD0490789949', 'B1266427117', 'attachments', 'ATT2609819366', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749384653442-481105643.png', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD4393629884', 'B1266427117', 'attachments', 'ATT2609819366', 'file_type', 'image/png', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD6820496108', 'B1266427117', 'attachments', 'ATT2609819366', 'file_size', '707647', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD9940856847', 'B1266427117', 'attachments', 'ATT2609819366', 'evidence_id', 'EVD2965193319', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD0403386776', 'B1266427117', 'attachments', 'ATT2609819366', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD7381973605', 'B1266427117', 'case_evidance', 'C002_EVD2965193319', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD3056012357', 'B1266427117', 'case_evidance', 'C002_EVD2965193319', 'evidence_id', 'EVD2965193319', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD9796222485', 'B1266427117', 'evidance_witnesses', 'EVD2965193319_202202022202', 'nic', '202202022202', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD5756265109', 'B1266427117', 'evidance_witnesses', 'EVD2965193319_202202022202', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD8620065102', 'B1266427117', 'evidance_witnesses', 'EVD2965193319_202202022202', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD2057055809', 'B1266427117', 'evidance_witnesses', 'EVD2965193319_202202022202', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD2562381818', 'B1266427117', 'evidance_witnesses', 'EVD2965193319_202202022202', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD1034758609', 'B1266427117', 'evidance_witnesses', 'EVD2965193319_202202022202', 'dob', '2002-02-02', 'INSERT', 'U001', '2025-06-08 17:40:53'),
('AUD1671483207', 'B5508913802', 'investigation_officer', 'INV1840539113_U003', 'officer_id', 'U003', 'INSERT', 'U001', '2025-06-08 19:04:06'),
('AUD7177311659', 'B9805388882', 'crimeoffence', 'OFF4368558494', 'crime_type', 'Insider Trading', 'UPDATE', 'U001', '2025-06-09 08:12:14'),
('AUD2624943328', 'B9805388882', 'crimeoffence', 'OFF4368558494', 'risk_score', '72', 'UPDATE', 'U001', '2025-06-09 08:12:14'),
('AUD0190813006', 'B3222249974', 'evidance', 'EVD6746367243', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD7065569663', 'B3222249974', 'evidance', 'EVD6746367243', 'details', 'ggggggggggg', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD1632959366', 'B3222249974', 'evidance', 'EVD6746367243', 'collected_dt', '2025-06-09 09:48:00', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD4215791182', 'B3222249974', 'evidance', 'EVD6746367243', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD7430239897', 'B3222249974', 'evidance', 'EVD6746367243', 'location', 'llll', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD1056916484', 'B3222249974', 'attachments', 'ATT8582486088', 'file_name', 'Screenshot 2024-12-17 123958.png', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD2228989136', 'B3222249974', 'attachments', 'ATT8582486088', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749465551795-805185580.png', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD6434020431', 'B3222249974', 'attachments', 'ATT8582486088', 'file_type', 'image/png', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD6144173149', 'B3222249974', 'attachments', 'ATT8582486088', 'file_size', '1974912', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD1355950959', 'B3222249974', 'attachments', 'ATT8582486088', 'evidence_id', 'EVD6746367243', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD1948645776', 'B3222249974', 'attachments', 'ATT8582486088', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD0574664016', 'B3222249974', 'case_evidance', 'C002_EVD6746367243', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD4307513614', 'B3222249974', 'case_evidance', 'C002_EVD6746367243', 'evidence_id', 'EVD6746367243', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD6761311059', 'B3222249974', 'evidance_witnesses', 'EVD6746367243_202202022202', 'nic', '202202022202', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD5301571213', 'B3222249974', 'evidance_witnesses', 'EVD6746367243_202202022202', 'name', 'Ghim Shasintha', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD1832448264', 'B3222249974', 'evidance_witnesses', 'EVD6746367243_202202022202', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD9788411053', 'B3222249974', 'evidance_witnesses', 'EVD6746367243_202202022202', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD2837546602', 'B3222249974', 'evidance_witnesses', 'EVD6746367243_202202022202', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD6977568867', 'B3222249974', 'evidance_witnesses', 'EVD6746367243_202202022202', 'dob', '2020-02-09', 'INSERT', 'U001', '2025-06-09 16:09:11'),
('AUD6187866974', 'B4082312854', 'evidance', 'EVD5974300921', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD0188881634', 'B4082312854', 'evidance', 'EVD5974300921', 'details', 'mmmmmmmmmmnnnnnnn', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD9761654601', 'B4082312854', 'evidance', 'EVD5974300921', 'collected_dt', '2025-06-09 12:30:00', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD9888833761', 'B4082312854', 'evidance', 'EVD5974300921', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD7974098664', 'B4082312854', 'evidance', 'EVD5974300921', 'investigation_id', 'INV4051508597', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD6875134115', 'B4082312854', 'attachments', 'ATT9863735497', 'file_name', 'Picture1.png', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD4168799028', 'B4082312854', 'attachments', 'ATT9863735497', 'file_path', 'C:\\Users\\imesh\\Documents\\P R O J E C T S\\HND\\FINAL\\lawspherelk\\backend\\uploads\\evidences\\temp\\1749472255603-790619285.png', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD8005877837', 'B4082312854', 'attachments', 'ATT9863735497', 'file_type', 'image/png', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD5231670307', 'B4082312854', 'attachments', 'ATT9863735497', 'file_size', '707647', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD2583856634', 'B4082312854', 'attachments', 'ATT9863735497', 'evidence_id', 'EVD5974300921', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD3461178090', 'B4082312854', 'attachments', 'ATT9863735497', 'uploaded_by', 'U001', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD9065164265', 'B4082312854', 'case_evidance', 'C002_EVD5974300921', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD6754242313', 'B4082312854', 'case_evidance', 'C002_EVD5974300921', 'evidence_id', 'EVD5974300921', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD9022581139', 'B4082312854', 'evidance', 'EVD5974300921', 'investigation_id', 'INV4051508597', 'UPDATE', 'U001', '2025-06-09 18:00:55'),
('AUD9501719144', 'B4082312854', 'crimeoffence_evidance', 'OFF002_EVD5974300921', 'offence_id', 'OFF002', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD9901113401', 'B4082312854', 'crimeoffence_evidance', 'OFF002_EVD5974300921', 'evidence_id', 'EVD5974300921', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD2236722964', 'B4082312854', 'evidance_witnesses', 'EVD5974300921_202202022202', 'nic', '202202022202', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD4578225244', 'B4082312854', 'evidance_witnesses', 'EVD5974300921_202202022202', 'name', 'Ghim Shasinthamm', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD8650371511', 'B4082312854', 'evidance_witnesses', 'EVD5974300921_202202022202', 'phone', '0768141745', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD2021076213', 'B4082312854', 'evidance_witnesses', 'EVD5974300921_202202022202', 'email', 'imeshmadush@gmail.com', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD0870355332', 'B4082312854', 'evidance_witnesses', 'EVD5974300921_202202022202', 'address', 'Hiyare galle', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD3377881588', 'B4082312854', 'evidance_witnesses', 'EVD5974300921_202202022202', 'dob', '2009-02-23', 'INSERT', 'U001', '2025-06-09 18:00:55'),
('AUD8166115038', 'B9138869401', 'evidance', 'EVD9517601372', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:23:55'),
('AUD2428251536', 'B9138869401', 'evidance', 'EVD9517601372', 'details', 'ssssssssssssss', 'INSERT', 'U001', '2025-06-09 18:23:55'),
('AUD5402927871', 'B9138869401', 'evidance', 'EVD9517601372', 'collected_dt', '2025-06-09 12:52:00', 'INSERT', 'U001', '2025-06-09 18:23:55'),
('AUD2465233259', 'B9138869401', 'evidance', 'EVD9517601372', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:23:55'),
('AUD3057860112', 'B9138869401', 'case_evidance', 'C0227480329_EVD9517601372', 'case_id', 'C0227480329', 'INSERT', 'U001', '2025-06-09 18:23:55'),
('AUD9413183339', 'B9138869401', 'case_evidance', 'C0227480329_EVD9517601372', 'evidence_id', 'EVD9517601372', 'INSERT', 'U001', '2025-06-09 18:23:55'),
('AUD4011034010', 'B9165707401', 'evidance', 'EVD7460557223', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD3339775621', 'B9165707401', 'evidance', 'EVD7460557223', 'details', 'nnnnnnnnnnnnnn', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD4716641062', 'B9165707401', 'evidance', 'EVD7460557223', 'collected_dt', '2025-06-09 12:54:00', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD1405074662', 'B9165707401', 'evidance', 'EVD7460557223', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD5806455388', 'B9165707401', 'evidance', 'EVD7460557223', 'location', 'sri lanka', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD9635929176', 'B9165707401', 'case_evidance', 'C1179593017_EVD7460557223', 'case_id', 'C1179593017', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD5096642824', 'B9165707401', 'case_evidance', 'C1179593017_EVD7460557223', 'evidence_id', 'EVD7460557223', 'INSERT', 'U001', '2025-06-09 18:24:31'),
('AUD6757035074', 'B5446028670', 'evidance', 'EVD9947769094', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:25:42'),
('AUD1628480023', 'B5446028670', 'evidance', 'EVD9947769094', 'details', 'ooooooooooooooo', 'INSERT', 'U001', '2025-06-09 18:25:42'),
('AUD7160598272', 'B5446028670', 'evidance', 'EVD9947769094', 'collected_dt', '2025-06-09 12:55:00', 'INSERT', 'U001', '2025-06-09 18:25:42'),
('AUD0169847731', 'B5446028670', 'evidance', 'EVD9947769094', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:25:42'),
('AUD8343632698', 'B5446028670', 'case_evidance', 'C003_EVD9947769094', 'case_id', 'C003', 'INSERT', 'U001', '2025-06-09 18:25:42'),
('AUD7013069848', 'B5446028670', 'case_evidance', 'C003_EVD9947769094', 'evidence_id', 'EVD9947769094', 'INSERT', 'U001', '2025-06-09 18:25:42'),
('AUD7104663129', 'B8651714790', 'evidance', 'EVD0508378050', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:26:26'),
('AUD5410195449', 'B8651714790', 'evidance', 'EVD0508378050', 'details', 'ppppppppppppp', 'INSERT', 'U001', '2025-06-09 18:26:26'),
('AUD4449428685', 'B8651714790', 'evidance', 'EVD0508378050', 'collected_dt', '2025-06-09 12:56:00', 'INSERT', 'U001', '2025-06-09 18:26:26'),
('AUD9141188940', 'B8651714790', 'evidance', 'EVD0508378050', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:26:26'),
('AUD5132157916', 'B8651714790', 'case_evidance', 'C9818234044_EVD0508378050', 'case_id', 'C9818234044', 'INSERT', 'U001', '2025-06-09 18:26:26'),
('AUD3463528388', 'B8651714790', 'case_evidance', 'C9818234044_EVD0508378050', 'evidence_id', 'EVD0508378050', 'INSERT', 'U001', '2025-06-09 18:26:26'),
('AUD2694881255', 'B9875844878', 'evidance', 'EVD5268204645', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:27:05'),
('AUD7455543312', 'B9875844878', 'evidance', 'EVD5268204645', 'details', 'lllllllllllllllllll', 'INSERT', 'U001', '2025-06-09 18:27:05'),
('AUD0636103052', 'B9875844878', 'evidance', 'EVD5268204645', 'collected_dt', '2025-06-09 12:56:00', 'INSERT', 'U001', '2025-06-09 18:27:05'),
('AUD3333680377', 'B9875844878', 'evidance', 'EVD5268204645', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:27:05'),
('AUD6561351334', 'B9875844878', 'case_evidance', 'C0227480329_EVD5268204645', 'case_id', 'C0227480329', 'INSERT', 'U001', '2025-06-09 18:27:05'),
('AUD0616260754', 'B9875844878', 'case_evidance', 'C0227480329_EVD5268204645', 'evidence_id', 'EVD5268204645', 'INSERT', 'U001', '2025-06-09 18:27:05'),
('AUD7900323563', 'B2627386428', 'evidance', 'EVD2177997380', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD4352568267', 'B2627386428', 'evidance', 'EVD2177997380', 'details', 'iiiiiiiiiiiiiiii', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD0522998162', 'B2627386428', 'evidance', 'EVD2177997380', 'collected_dt', '2025-06-09 12:57:00', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD1282135559', 'B2627386428', 'evidance', 'EVD2177997380', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD5517032894', 'B2627386428', 'evidance', 'EVD2177997380', 'investigation_id', 'INV1840539113', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD2920741919', 'B2627386428', 'case_evidance', 'C002_EVD2177997380', 'case_id', 'C002', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD9233508313', 'B2627386428', 'case_evidance', 'C002_EVD2177997380', 'evidence_id', 'EVD2177997380', 'INSERT', 'U001', '2025-06-09 18:27:33'),
('AUD7306752342', 'B2627386428', 'evidance', 'EVD2177997380', 'investigation_id', 'INV1840539113', 'UPDATE', 'U001', '2025-06-09 18:27:33'),
('AUD6613292386', 'B2613267508', 'evidance', 'EVD3344765914', 'type', 'Voice Statement', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD3688833367', 'B2613267508', 'evidance', 'EVD3344765914', 'details', 'jjjjjjjjjjjjjjjj', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD6288276127', 'B2613267508', 'evidance', 'EVD3344765914', 'collected_dt', '2025-06-09 12:58:00', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD2210836140', 'B2613267508', 'evidance', 'EVD3344765914', 'officer_id', 'U001', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD4485524793', 'B2613267508', 'case_evidance', 'C005_EVD3344765914', 'case_id', 'C005', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD1517606287', 'B2613267508', 'case_evidance', 'C005_EVD3344765914', 'evidence_id', 'EVD3344765914', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD5188936967', 'B2613267508', 'crimeoffence_evidance', 'OFF9662240753_EVD3344765914', 'offence_id', 'OFF9662240753', 'INSERT', 'U001', '2025-06-09 18:28:32'),
('AUD7064156638', 'B2613267508', 'crimeoffence_evidance', 'OFF9662240753_EVD3344765914', 'evidence_id', 'EVD3344765914', 'INSERT', 'U001', '2025-06-09 18:28:32');

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
('C9999816989', 'test 2', 'Civil Dispute', 'inprogress', '2025-05-31 21:08:15', NULL, 'U002', 'CMP3538836277'),
('C1179593017', 's case', 'Criminal', 'inprogress', '2025-06-02 13:06:28', NULL, 'U003', 'CMP0001774014'),
('C0227480329', 'test topic', 'Missing Person', 'inprogress', '2025-06-02 10:05:42', NULL, 'U002', 'CMP2540564818');

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
('C002', 'EVD0518047356'),
('C002', 'EVD2177997380'),
('C002', 'EVD2426255748'),
('C002', 'EVD2965193319'),
('C002', 'EVD3659665199'),
('C002', 'EVD5974300921'),
('C002', 'EVD6746367243'),
('C003', 'EVD003'),
('C003', 'EVD9947769094'),
('C004', 'EVD004'),
('C004', 'EVD006'),
('C004', 'EVD2426255748'),
('C004', 'EVD5974300921'),
('C005', 'EVD005'),
('C005', 'EVD3344765914'),
('C0227480329', 'EVD0640162873'),
('C0227480329', 'EVD5268204645'),
('C0227480329', 'EVD9517601372'),
('C1179593017', 'EVD2876307032'),
('C1179593017', 'EVD7193972668'),
('C1179593017', 'EVD7460557223'),
('C9818234044', 'EVD0425084493'),
('C9818234044', 'EVD0508378050'),
('C9818234044', 'EVD3863004651'),
('C9818234044', 'EVD9059560651'),
('C9999816989', 'EVD8738612103'),
('C9999816989', 'EVD8738612202');

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
('CMP001', 'Stolen motorcycle from residence at 23 Galle Road. Black Honda CB150, license KU-2343.', '2025-04-12 16:11:00', 'viewed', 'U001', 'EVD001'),
('CMP002', 'A child from Colombo Central School went missing during school hours. Last seen near back gate.', '2025-04-02 09:50:00', 'viewed', 'U005', 'EVD002'),
('CMP003', 'Multiple citizens reported an online scam claiming to offer fake police job openings.', '2025-03-28 13:45:00', 'viewed', 'U003', 'EVD003'),
('CMP004', 'Motorcycle stolen from galle BOC bank area. Honda CB150, license plate WP-KU2343.', '2025-04-03 18:00:00', 'viewed', 'U003', 'EVD004'),
('CMP005', 'School principal received anonymous threats via phone from suspected gang members.', '2025-04-05 08:00:00', 'viewed', 'U002', 'EVD005'),
('CMP3538836277', 'civil dispute 1', '2025-05-29 23:49:30', 'viewed', 'U001', 'EVD8738612103'),
('CMP2540564818', 'missing mnmmm', '2025-06-02 10:01:42', 'viewed', 'U001', 'EVD0640162873'),
('CMP0001774014', 'descritpion 23', '2025-06-02 13:05:43', 'viewed', 'U001', 'EVD2876307032'),
('CMP3591845754', 'This is a test complaint', '2025-05-26 00:31:04', 'viewed', 'U002', 'EVD0425084493');

-- --------------------------------------------------------

--
-- Table structure for table `crimeoffence`
--

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

--
-- Dumping data for table `crimeoffence`
--

INSERT INTO `crimeoffence` (`offence_id`, `status`, `crime_type`, `risk_score`, `reported_dt`, `happened_dt`, `criminal_id`, `case_id`) VALUES
('OFF002', 'Alleged', 'Child Abduction', 85, '2025-04-02 09:50:00', '2025-04-02 09:45:00', 'CRIM002', 'C002'),
('OFF003', 'Convicted', 'Cyber Fraud', 60, '2025-03-28 13:45:00', '2025-03-27 20:00:00', 'CRIM003', 'C005'),
('OFF004', 'Convicted', 'Motorcycle Theft', 65, '2025-04-03 18:00:00', '2025-04-03 17:45:00', 'CRIM004', 'C004'),
('OFF005', 'Convicted', 'Threatening Behavior', 75, '2025-04-05 08:00:00', '2025-04-04 21:00:00', 'CRIM005', 'C003'),
('OFF4725497606', 'Alleged', 'Theft', 25, '2025-06-04 11:37:00', '2025-06-12 11:37:00', 'CRIM001', 'C002'),
('OFF9276946595', 'Alleged', 'Assault', 60, '2025-06-05 11:57:00', '2025-06-11 11:57:00', 'CRIM001', 'C002'),
('OFF3547889430', 'Convicted', 'Blackmail', 73, '2025-06-12 07:59:00', '2025-06-04 13:30:00', 'CRIM001', 'C0227480329'),
('OFF9865937223', 'Alleged', 'Armed Robbery', 88, '2025-06-27 08:09:00', '2025-06-21 13:39:00', 'CRIM004', 'C004'),
('OFF9662240753', 'Alleged', 'Domestic Violence', 36, '2025-06-28 20:50:00', '2025-06-01 20:50:00', 'CRIM003', 'C005'),
('OFF4368558494', 'Alleged', 'Insider Trading', 72, '2025-06-14 00:01:00', '2025-06-04 00:01:00', 'CRIM004', 'C9818234044');

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
('OFF002', 'EVD5974300921'),
('OFF003', 'EVD003'),
('OFF004', 'EVD004'),
('OFF004', 'EVD006'),
('OFF005', 'EVD005'),
('OFF9662240753', 'EVD3344765914');

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

--
-- Dumping data for table `criminalrecord`
--

INSERT INTO `criminalrecord` (`criminal_id`, `fingerprint_hash`, `photo`, `nic`, `name`, `phone`, `address`, `dob`) VALUES
('CRIM001', 'abcdef1234567890', 'https://randomuser.me/api/portraits/men/12.jpg', '198877665544', 'Devinda Silva', '0779988776', '45, Park Road, Colombo', '1996-06-25'),
('CRIM002', 'fedcba0987654321', 'https://randomuser.me/api/portraits/men/13.jpg', '199511223344', 'Saman Perera', '0711233455', '10/A, Hill Street, Kandy', '1995-09-12'),
('CRIM003', '9876543210abcdef', 'https://randomuser.me/api/portraits/men/14.jpg', '200055443322', 'Nayana Kumari', '0705566778', '7, Lake View, Galle', '2000-02-01'),
('CRIM004', '0123456789fedcbaac', 'https://randomuser.me/api/portraits/men/15.jpg', '199233445567', 'Asanka Wijeratne', '0766544323', '12B, Sea Road, Negombo', '1992-11-05'),
('CRIM005', 'bacdef0123456789', 'https://randomuser.me/api/portraits/men/16.jpg', '200499887766', 'Dilani Fernando', '0722344566', '3rd Lane, Kurunegala', '2004-04-28'),
('CRIM6104702777', NULL, NULL, '200220202220', 'Ghim Shasintha', '0768141745', 'Hiyare galle', '2002-02-02'),
('CRIM7006881266', '0123456789fedcbaacbbb', NULL, '200220202260', 'Ghim', '0768141745', '12B, Sea Road, Negombo', '2002-02-02'),
('CRIM8854603211', NULL, NULL, '200220202261', 'Shasintha', '0768141745', 'Hiyare galle', '2002-02-02'),
('CRIM8976209619', NULL, NULL, '200220202226', 'Ghim Shasintha', '0768141745', 'Hiyare galle', '2002-02-02');

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
('EVD2426255748', 'Fingerprint', 'Galle 01', 'details 1', '2025-06-01 23:26:00', 'U001', 'INV1840539113'),
('EVD0425084493', 'Voice Statement', NULL, 'Voice statement details for test.', '2025-05-26 00:31:04', 'U002', NULL),
('EVD8738612103', 'Voice Statement', NULL, 'civil dispute 1', '2025-05-29 23:49:30', 'U001', NULL),
('EVD8738612202', 'Voice Statement', NULL, 'test voice 2', '2025-05-30 06:31:37', 'U005', NULL),
('EVD0640162873', 'Voice Statement', NULL, 'missing around 10 am', '2025-06-02 10:01:42', 'U001', NULL),
('EVD2876307032', 'Voice Statement', NULL, 'descritpion 23', '2025-06-02 13:05:43', 'U001', NULL),
('EVD7193972668', 'Fingerprint', 'galle 09', 'evidance 03', '2025-06-02 22:49:00', 'U001', NULL),
('EVD6060011725', 'CCTV Recording', 'galle 09', 'description 1', '2025-06-04 20:47:39', 'U001', NULL),
('EVD9490566249', 'CCTV Recording', 'galle 09', 'description 002', '2025-06-04 20:48:48', 'U001', NULL),
('EVD3611648521', 'Photograph', 'galle 09', 'descriptipnv', '2025-06-04 20:51:58', 'U001', NULL),
('EVD8338285828', 'Video Footage', 'galle 09', 'description1', '2025-06-04 21:50:48', 'U001', NULL),
('EVD9059560651', 'Video Footage', 'galle 09', 'description1', '2025-06-04 21:51:58', 'U001', NULL),
('EVD3659665199', 'DNA Sample', 'galle 09', 'dna description 1', '2025-06-04 21:59:00', 'U001', 'INV1840539113'),
('EVD3863004651', 'CCTV Recording', 'galle 09', 'deshjgksdfs', '2025-06-04 22:05:29', 'U001', NULL),
('EVD0518047356', 'Fingerprint', '', 'yyyyyyyyyyyyyy', '2025-06-08 10:00:37', 'U001', 'INV4051508597'),
('EVD2965193319', 'Photograph', '', 'hhhhhhhhhh', '2025-06-08 12:10:53', 'U001', 'INV1840539113'),
('EVD6746367243', 'Voice Statement', 'llll', 'ggggggggggg', '2025-06-09 09:48:00', 'U001', NULL),
('EVD5974300921', 'Voice Statement', '', 'mmmmmmmmmmnnnnnnn', '2025-06-09 12:30:00', 'U001', 'INV4051508597'),
('EVD9517601372', 'Voice Statement', '', 'ssssssssssssss', '2025-06-09 12:52:00', 'U001', NULL),
('EVD7460557223', 'Voice Statement', 'sri lanka', 'nnnnnnnnnnnnnn', '2025-06-09 12:54:00', 'U001', NULL),
('EVD9947769094', 'Voice Statement', '', 'ooooooooooooooo', '2025-06-09 12:55:00', 'U001', NULL),
('EVD0508378050', 'Voice Statement', '', 'ppppppppppppp', '2025-06-09 12:56:00', 'U001', NULL),
('EVD5268204645', 'Voice Statement', '', 'lllllllllllllllllll', '2025-06-09 12:56:00', 'U001', NULL),
('EVD2177997380', 'Voice Statement', '', 'iiiiiiiiiiiiiiii', '2025-06-09 12:57:00', 'U001', 'INV1840539113'),
('EVD3344765914', 'Voice Statement', '', 'jjjjjjjjjjjjjjjj', '2025-06-09 12:58:00', 'U001', NULL);

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
('EVD0640162873', '200220202220', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2002-02-02'),
('EVD8738612103', '200220202220', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2003-03-03'),
('EVD0425084493', '900000000V', 'Test User updated 8', '0771234568', 'testupdateaad2@example.com', '123 Main Stss', '1999-12-28'),
('EVD2876307032', '198002700081', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2004-02-20'),
('EVD2426255748', '200220202220', 'Ghim Shasintha', '0768141745', 'imeshm@gmail.com', 'Hiyare galle', '2002-02-02'),
('EVD2426255748', '300330303330', 'Ghim Shasintha', '0768141745', 'imesh@gmail.com', 'Hiyare galle, 8', '2002-02-02'),
('EVD7193972668', '300330303330', 'Ghim Shasintha', '0768141745', 'imesh@gmail.com', 'Hiyare galle 01', '2002-02-02'),
('EVD9059560651', '300330303330', 'Asanka Wijeratnee', '0771234568', 'usefortemplokan78@hotmail.com', 'Hiyare galle 01', '2020-02-02'),
('EVD3659665199', '202202022202', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2002-02-02'),
('EVD3863004651', '202202022202', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare East, Hiyare', '2002-02-02'),
('EVD2965193319', '202202022202', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2002-02-02'),
('EVD6746367243', '202202022202', 'Ghim Shasintha', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2020-02-09'),
('EVD5974300921', '202202022202', 'Ghim Shasinthamm', '0768141745', 'imeshmadush@gmail.com', 'Hiyare galle', '2009-02-23');

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
  `status` enum('inprogress','closed','completed') DEFAULT NULL,
  `case_id` varchar(36) DEFAULT NULL,
  PRIMARY KEY (`investigation_id`),
  KEY `case_id` (`case_id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `investigation`
--

INSERT INTO `investigation` (`investigation_id`, `topic`, `start_dt`, `end_dt`, `location`, `status`, `case_id`) VALUES
('INV001', 'check for evidence for bike stoel at BOC bank', '2025-04-10 14:26:30', '2025-04-16 14:26:30', 'bank BOC', 'closed', 'C004'),
('INV4051508597', 'Looking for fingerprintsss', '2025-06-03 11:50:14', NULL, 'galle main branch', 'inprogress', 'C002'),
('INV1840539113', 'Looking for fingerprints 2', '2025-06-03 11:56:31', NULL, 'galle 2', 'inprogress', 'C002');

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
('INV001', 'U005'),
('INV1840539113', 'U002'),
('INV1840539113', 'U003'),
('INV4051508597', 'U002'),
('INV4051508597', 'U003'),
('INV4051508597', 'U004'),
('INV4051508597', 'U005');

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
-- Table structure for table `notifications`
--

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
('U002', 'Kumara Perera', 'kumara@gmail.com', '200230303330', '0712345678', 'Maradana, Colombo 10', '2025-04-05 09:15:22', 'Sub Inspector', 'https://randomuser.me/api/portraits/men/33.jpg'),
('U003', 'Malini Fernando', 'malini@gmail.com', '200240404440', '0763456789', 'Kandy Road, Kurunegala', '2025-04-10 14:30:45', 'Sub Inspector', 'https://randomuser.me/api/portraits/women/32.jpg'),
('U004', 'Nimal Gunawardena', 'nimal@gmail.com', '200250505550', '0754567890', 'Temple Road, Matara', '2025-04-15 11:20:33', 'Sub Inspector', 'https://randomuser.me/api/portraits/men/39.jpg'),
('U005', 'Chamari Jayasuriya', 'chamari@gmail.com', '200260606660', '0775678901', 'Beach Road, Negombo', '2025-04-20 16:45:10', 'Sergeant', 'https://randomuser.me/api/portraits/women/36.jpg'),
('U006', 'iamoic', 'iamoic@gmail.com', '100110101110', '0771111111', 'galle 0', '2025-06-03 10:53:42', 'OIC', 'https://randomuser.me/api/portraits/men/37.jpg');

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
