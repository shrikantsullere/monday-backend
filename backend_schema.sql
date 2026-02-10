-- phpMyAdmin SQL Dump
-- Monday.com Clone Database Schema
-- Generated for the User

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE `Users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('Admin','Manager','User') DEFAULT 'User',
  `avatar` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `name`, `email`, `password`, `role`, `avatar`, `phone`, `address`, `status`, `createdAt`, `updatedAt`) VALUES
(1, 'System Admin', 'admin@monday.com', '$2a$10$7R9iJ6Z0.rGvGvGvGvGvGvGvGvGvGvGvGvGvGvGvGvGvGvGvGvGv', 'Admin', NULL, NULL, NULL, 'active', NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `Boards`
--

CREATE TABLE `Boards` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `type` varchar(255) DEFAULT 'board',
  `workspace` varchar(255) DEFAULT 'Main Workspace',
  `folder` varchar(255) DEFAULT 'General',
  `columns` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Boards`
--

INSERT INTO `Boards` (`id`, `name`, `type`, `workspace`, `folder`, `columns`, `createdAt`, `updatedAt`) VALUES
(1, 'Project Pipeline', 'pipeline', 'Main Workspace', 'Active Projects', '[{"id": "status", "type": "status", "title": "Status"}, {"id": "priority", "type": "status", "title": "Priority"}, {"id": "progress", "type": "progress", "title": "Progress"}, {"id": "timeline", "type": "timeline", "title": "Timeline"}]', NOW(), NOW()),
(2, 'SIRA Projects', 'board', 'Main Workspace', 'Active Projects', '[{"id": "name", "type": "text", "title": "Item Name"}, {"id": "person", "type": "person", "title": "Person"}, {"id": "status", "type": "status", "title": "Status"}, {"id": "timeline", "type": "timeline", "title": "Timeline"}, {"id": "receivedDate", "type": "date", "title": "Received Date"}, {"id": "progress", "type": "progress", "title": "Progress"}, {"id": "payment", "type": "payment", "title": "Payment (Numbers)"}, {"id": "timeTracking", "type": "time_tracking", "title": "Time Tracking"}]', NOW(), NOW()),
(3, 'AI Future Projects', 'ai_future', 'Main Workspace', 'AI & Innovation', '[{"id": "person", "type": "person", "title": "Owner"}, {"id": "aiModel", "type": "text", "title": "AI Model"}, {"id": "status", "type": "status", "title": "Status"}, {"id": "risk", "type": "status", "title": "Risk Level"}, {"id": "priority", "type": "status", "title": "Priority"}, {"id": "timeline", "type": "timeline", "title": "Timeline"}, {"id": "progress", "type": "progress", "title": "Progress"}]', NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `Groups`
--

CREATE TABLE `Groups` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `color` varchar(255) DEFAULT NULL,
  `BoardId` int(11) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `groups_ibfk_1` FOREIGN KEY (`BoardId`) REFERENCES `Boards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Groups`
--

INSERT INTO `Groups` (`id`, `title`, `color`, `BoardId`, `createdAt`, `updatedAt`) VALUES
(1, 'Active Projects', '#0085ff', 1, NOW(), NOW()),
(2, 'Completed', '#00c875', 1, NOW(), NOW()),
(3, 'Mustafa - Project Manager', '#00c875', 2, NOW(), NOW()),
(4, 'Research Phase', '#a25ddc', 3, NOW(), NOW());

-- --------------------------------------------------------

--
-- Table structure for table `Items`
--

CREATE TABLE `Items` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` varchar(255) DEFAULT NULL,
  `person` varchar(255) DEFAULT NULL,
  `timeline` varchar(255) DEFAULT NULL,
  `receivedDate` varchar(255) DEFAULT NULL,
  `progress` int(11) DEFAULT 0,
  `timeTracking` varchar(255) DEFAULT '00:00:00',
  `payment` decimal(10,2) DEFAULT 0.00,
  `isSubItem` tinyint(1) DEFAULT 0,
  `priority` varchar(255) DEFAULT NULL,
  `risk` varchar(255) DEFAULT NULL,
  `dealValue` decimal(10,2) DEFAULT NULL,
  `dealStatus` varchar(255) DEFAULT NULL,
  `invoiceSent` tinyint(1) DEFAULT 0,
  `aiModel` varchar(255) DEFAULT NULL,
  `customFields` json DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `parentItemId` int(11) DEFAULT NULL,
  `assignedToId` int(11) DEFAULT NULL,
  `GroupId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `items_ibfk_1` FOREIGN KEY (`parentItemId`) REFERENCES `Items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `items_ibfk_2` FOREIGN KEY (`assignedToId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `items_ibfk_3` FOREIGN KEY (`GroupId`) REFERENCES `Groups` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `Items`
--

INSERT INTO `Items` (`id`, `name`, `status`, `person`, `timeline`, `receivedDate`, `progress`, `timeTracking`, `payment`, `isSubItem`, `createdAt`, `updatedAt`, `assignedToId`, `GroupId`) VALUES
(1, 'Website Redesign', 'Working on it', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NOW(), NOW(), 1, 1),
(2, 'Mobile App API', 'Waiting', NULL, NULL, NULL, 0, '00:00:00', 0.00, 0, NOW(), NOW(), 1, 1),
(3, 'Q1 Security Audit', 'Done', NULL, NULL, NULL, 100, '00:00:00', 0.00, 0, NOW(), NOW(), 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `Notifications`
--

CREATE TABLE `Notifications` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `content` varchar(255) NOT NULL,
  `isRead` tinyint(1) DEFAULT 0,
  `type` varchar(255) DEFAULT NULL,
  `link` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `UserId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `notifications_ibfk_1` FOREIGN KEY (`UserId`) REFERENCES `Users` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Files`
--

CREATE TABLE `Files` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `url` varchar(255) NOT NULL,
  `size` int(11) DEFAULT NULL,
  `type` varchar(255) DEFAULT NULL,
  `uploadedBy` varchar(255) DEFAULT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `ItemId` int(11) DEFAULT NULL,
  `userId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `files_ibfk_1` FOREIGN KEY (`ItemId`) REFERENCES `Items` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `files_ibfk_2` FOREIGN KEY (`userId`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Forms`
--

CREATE TABLE `Forms` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `description` varchar(255) DEFAULT NULL,
  `fields` json DEFAULT NULL,
  `isPublished` tinyint(1) DEFAULT 0,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  `BoardId` int(11) DEFAULT NULL,
  PRIMARY KEY (`id`),
  CONSTRAINT `forms_ibfk_1` FOREIGN KEY (`BoardId`) REFERENCES `Boards` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Table structure for table `Folders`
--

CREATE TABLE `Folders` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `createdAt` datetime NOT NULL,
  `updatedAt` datetime NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


COMMIT;
