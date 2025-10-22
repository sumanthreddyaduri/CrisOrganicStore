CREATE TABLE `blogPosts` (
	`id` varchar(64) NOT NULL,
	`title` varchar(255) NOT NULL,
	`slug` varchar(255) NOT NULL,
	`excerpt` varchar(500),
	`content` text,
	`image` text,
	`category` varchar(100),
	`tags` json,
	`author` varchar(255),
	`published` boolean DEFAULT false,
	`viewCount` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `blogPosts_id` PRIMARY KEY(`id`),
	CONSTRAINT `blogPosts_slug_unique` UNIQUE(`slug`)
);
--> statement-breakpoint
CREATE TABLE `cartItems` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`quantity` int NOT NULL DEFAULT 1,
	`addedAt` timestamp DEFAULT (now()),
	CONSTRAINT `cartItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `contactSubmissions` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`subject` varchar(255) NOT NULL,
	`message` text NOT NULL,
	`status` enum('new','read','responded','closed') DEFAULT 'new',
	`response` text,
	`respondedBy` varchar(64),
	`respondedAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `contactSubmissions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `merchantProfiles` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`storeName` varchar(255) NOT NULL,
	`storeDescription` text,
	`logo` text,
	`banner` text,
	`phone` varchar(20),
	`address` json,
	`bankDetails` json,
	`verified` boolean DEFAULT false,
	`rating` decimal(3,2) DEFAULT '0',
	`totalSales` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `merchantProfiles_id` PRIMARY KEY(`id`),
	CONSTRAINT `merchantProfiles_userId_unique` UNIQUE(`userId`)
);
--> statement-breakpoint
CREATE TABLE `notifications` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`type` enum('order_status','promotion','review_request','system','message') NOT NULL,
	`title` varchar(255) NOT NULL,
	`content` text,
	`read` boolean DEFAULT false,
	`actionUrl` text,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `notifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orderItems` (
	`id` varchar(64) NOT NULL,
	`orderId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`productName` varchar(255) NOT NULL,
	`quantity` int NOT NULL,
	`price` int NOT NULL,
	`subtotal` int NOT NULL,
	CONSTRAINT `orderItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`orderNumber` varchar(50),
	`status` enum('pending','confirmed','processing','shipped','delivered','cancelled','refunded') DEFAULT 'pending',
	`subtotal` int NOT NULL,
	`tax` int DEFAULT 0,
	`shipping` int DEFAULT 0,
	`discount` int DEFAULT 0,
	`total` int NOT NULL,
	`promoCode` varchar(50),
	`paymentMethod` enum('credit_card','paypal','apple_pay','bank_transfer'),
	`paymentStatus` enum('pending','completed','failed','refunded') DEFAULT 'pending',
	`shippingAddress` json NOT NULL,
	`billingAddress` json,
	`notes` text,
	`trackingNumber` varchar(100),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `orders_id` PRIMARY KEY(`id`),
	CONSTRAINT `orders_orderNumber_unique` UNIQUE(`orderNumber`)
);
--> statement-breakpoint
CREATE TABLE `products` (
	`id` varchar(64) NOT NULL,
	`name` varchar(255) NOT NULL,
	`description` text,
	`shortDescription` varchar(500),
	`price` int NOT NULL,
	`originalPrice` int,
	`sku` varchar(100),
	`category` varchar(100) DEFAULT 'barley-powder',
	`image` text,
	`images` json,
	`nutritionInfo` json,
	`ingredients` text,
	`weight` varchar(50),
	`stock` int DEFAULT 0,
	`rating` decimal(3,2) DEFAULT '0',
	`reviewCount` int DEFAULT 0,
	`featured` boolean DEFAULT false,
	`active` boolean DEFAULT true,
	`merchantId` varchar(64),
	`createdAt` timestamp DEFAULT (now()),
	`updatedAt` timestamp DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `products_id` PRIMARY KEY(`id`),
	CONSTRAINT `products_sku_unique` UNIQUE(`sku`)
);
--> statement-breakpoint
CREATE TABLE `promoCodes` (
	`id` varchar(64) NOT NULL,
	`code` varchar(50) NOT NULL,
	`description` text,
	`discountType` enum('percentage','fixed') NOT NULL,
	`discountValue` int NOT NULL,
	`minPurchase` int DEFAULT 0,
	`maxUses` int,
	`currentUses` int DEFAULT 0,
	`active` boolean DEFAULT true,
	`expiresAt` timestamp,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `promoCodes_id` PRIMARY KEY(`id`),
	CONSTRAINT `promoCodes_code_unique` UNIQUE(`code`)
);
--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`rating` int NOT NULL,
	`title` varchar(255),
	`content` text,
	`verified` boolean DEFAULT false,
	`helpful` int DEFAULT 0,
	`createdAt` timestamp DEFAULT (now()),
	CONSTRAINT `reviews_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `wishlistItems` (
	`id` varchar(64) NOT NULL,
	`userId` varchar(64) NOT NULL,
	`productId` varchar(64) NOT NULL,
	`addedAt` timestamp DEFAULT (now()),
	CONSTRAINT `wishlistItems_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `users` MODIFY COLUMN `role` enum('user','merchant','admin') NOT NULL DEFAULT 'user';--> statement-breakpoint
ALTER TABLE `users` ADD `phone` varchar(20);--> statement-breakpoint
ALTER TABLE `users` ADD `avatar` text;--> statement-breakpoint
ALTER TABLE `users` ADD CONSTRAINT `users_email_unique` UNIQUE(`email`);