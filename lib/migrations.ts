/**
 * MySQL DDL for all King Fitness tables.
 * Run with: npm run db:migrate (after setting DB_* env vars).
 */
export const MIGRATIONS: { name: string; sql: string }[] = [
  {
    name: '001_users',
    sql: `
      CREATE TABLE IF NOT EXISTS users (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        display_name VARCHAR(120) NOT NULL,
        avatar_url VARCHAR(500),
        role ENUM('user','provider','admin','super_admin') NOT NULL DEFAULT 'user',
        status ENUM('active','suspended') NOT NULL DEFAULT 'active',
        email_verified_at DATETIME NULL,
        timezone VARCHAR(64) DEFAULT 'UTC',
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '002_sessions',
    sql: `
      CREATE TABLE IF NOT EXISTS sessions (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        token VARCHAR(128) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_token (token),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '003_password_reset_tokens',
    sql: `
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        token VARCHAR(128) NOT NULL UNIQUE,
        expires_at DATETIME NOT NULL,
        used_at DATETIME NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '004_audit_logs',
    sql: `
      CREATE TABLE IF NOT EXISTS audit_logs (
        id CHAR(36) PRIMARY KEY,
        actor_id CHAR(36),
        action VARCHAR(120) NOT NULL,
        target_type VARCHAR(80),
        target_id VARCHAR(120),
        before_state JSON NULL,
        after_state JSON NULL,
        ip_address VARCHAR(64),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_actor (actor_id),
        INDEX idx_action (action)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '005_services',
    sql: `
      CREATE TABLE IF NOT EXISTS services (
        id CHAR(36) PRIMARY KEY,
        provider_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        session_count INT NOT NULL DEFAULT 1,
        duration_minutes INT NOT NULL DEFAULT 60,
        price_cents INT NOT NULL,
        buffer_after_minutes INT NOT NULL DEFAULT 0,
        max_advance_days INT NOT NULL DEFAULT 60,
        cancellation_cutoff_hours INT NOT NULL DEFAULT 24,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (provider_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '006_availability_rules',
    sql: `
      CREATE TABLE IF NOT EXISTS availability_rules (
        id CHAR(36) PRIMARY KEY,
        provider_id CHAR(36) NOT NULL,
        day_of_week TINYINT NOT NULL,
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '007_availability_overrides',
    sql: `
      CREATE TABLE IF NOT EXISTS availability_overrides (
        id CHAR(36) PRIMARY KEY,
        provider_id CHAR(36) NOT NULL,
        date DATE NOT NULL,
        is_blocked TINYINT(1) NOT NULL DEFAULT 1,
        note VARCHAR(500),
        FOREIGN KEY (provider_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY uniq_provider_date (provider_id, date)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '008_booking_holds',
    sql: `
      CREATE TABLE IF NOT EXISTS booking_holds (
        id CHAR(36) PRIMARY KEY,
        slot_key VARCHAR(120) NOT NULL UNIQUE,
        provider_id CHAR(36) NOT NULL,
        service_id CHAR(36) NOT NULL,
        user_id CHAR(36),
        start_at DATETIME NOT NULL,
        end_at DATETIME NOT NULL,
        held_by_ip VARCHAR(64),
        expires_at DATETIME NOT NULL,
        INDEX idx_expires (expires_at),
        INDEX idx_slot_key (slot_key)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '009_bookings',
    sql: `
      CREATE TABLE IF NOT EXISTS bookings (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        provider_id CHAR(36) NOT NULL,
        service_id CHAR(36) NOT NULL,
        start_at DATETIME NOT NULL,
        end_at DATETIME NOT NULL,
        status ENUM(
          'pending','confirmed','cancelled_user','cancelled_provider','completed','no_show'
        ) NOT NULL DEFAULT 'pending',
        notes TEXT,
        price_cents INT NOT NULL,
        sessions_remaining INT NOT NULL DEFAULT 1,
        stripe_payment_intent_id VARCHAR(255),
        cancellation_reason TEXT,
        refund_status VARCHAR(40),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id),
        FOREIGN KEY (provider_id) REFERENCES users(id),
        FOREIGN KEY (service_id) REFERENCES services(id),
        INDEX idx_status_start (status, start_at),
        INDEX idx_user (user_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '010_products',
    sql: `
      CREATE TABLE IF NOT EXISTS products (
        id CHAR(36) PRIMARY KEY,
        slug VARCHAR(180) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        category VARCHAR(80),
        price_cents INT NOT NULL,
        compare_at_cents INT NULL,
        currency VARCHAR(8) NOT NULL DEFAULT 'usd',
        stock_quantity INT NOT NULL DEFAULT 0,
        image_url VARCHAR(500),
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '011_orders',
    sql: `
      CREATE TABLE IF NOT EXISTS orders (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        status ENUM('pending','paid','fulfilled','cancelled','refunded') NOT NULL DEFAULT 'pending',
        subtotal_cents INT NOT NULL,
        tax_cents INT NOT NULL DEFAULT 0,
        shipping_cents INT NOT NULL DEFAULT 0,
        total_cents INT NOT NULL,
        currency VARCHAR(8) NOT NULL DEFAULT 'usd',
        stripe_payment_intent_id VARCHAR(255),
        shipping_address JSON,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '012_order_items',
    sql: `
      CREATE TABLE IF NOT EXISTS order_items (
        id CHAR(36) PRIMARY KEY,
        order_id CHAR(36) NOT NULL,
        product_id CHAR(36) NOT NULL,
        name VARCHAR(255) NOT NULL,
        unit_price_cents INT NOT NULL,
        quantity INT NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '013_payment_intents',
    sql: `
      CREATE TABLE IF NOT EXISTS payment_intents (
        id CHAR(36) PRIMARY KEY,
        stripe_payment_intent_id VARCHAR(255) UNIQUE,
        user_id CHAR(36) NOT NULL,
        amount_cents INT NOT NULL,
        currency VARCHAR(8) NOT NULL DEFAULT 'usd',
        status VARCHAR(40) NOT NULL,
        metadata JSON,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '014_transactions',
    sql: `
      CREATE TABLE IF NOT EXISTS transactions (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        payment_intent_id CHAR(36),
        type ENUM('charge','refund') NOT NULL,
        amount_cents INT NOT NULL,
        fee_cents INT NOT NULL DEFAULT 0,
        net_cents INT NOT NULL,
        description VARCHAR(500),
        stripe_charge_id VARCHAR(255),
        stripe_refund_id VARCHAR(255),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '015_refunds',
    sql: `
      CREATE TABLE IF NOT EXISTS refunds (
        id CHAR(36) PRIMARY KEY,
        transaction_id CHAR(36),
        amount_cents INT NOT NULL,
        reason VARCHAR(255),
        status VARCHAR(40) NOT NULL,
        stripe_refund_id VARCHAR(255),
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '016_payment_methods',
    sql: `
      CREATE TABLE IF NOT EXISTS payment_methods (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        stripe_payment_method_id VARCHAR(255) NOT NULL,
        type VARCHAR(20) NOT NULL,
        last4 VARCHAR(4),
        brand VARCHAR(40),
        exp_month INT,
        exp_year INT,
        is_default TINYINT(1) NOT NULL DEFAULT 0,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '017_admin_roles',
    sql: `
      CREATE TABLE IF NOT EXISTS admin_roles (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL UNIQUE,
        role ENUM('super_admin','admin','moderator') NOT NULL,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '018_admin_notes',
    sql: `
      CREATE TABLE IF NOT EXISTS admin_notes (
        id CHAR(36) PRIMARY KEY,
        target_type VARCHAR(80) NOT NULL,
        target_id VARCHAR(120) NOT NULL,
        admin_id CHAR(36) NOT NULL,
        content TEXT,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '019_verifications',
    sql: `
      CREATE TABLE IF NOT EXISTS verifications (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL UNIQUE,
        type ENUM('government_id','phone','email','selfie','business_license','professional_cert') NOT NULL,
        status ENUM('pending','under_review','approved','rejected','expired') NOT NULL DEFAULT 'pending',
        submitted_at DATETIME,
        reviewed_at DATETIME,
        reviewed_by CHAR(36),
        rejection_reason TEXT,
        document_type VARCHAR(80),
        document_urls JSON,
        expiry_date DATE,
        metadata JSON,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '020_verification_badges',
    sql: `
      CREATE TABLE IF NOT EXISTS verification_badges (
        id CHAR(36) PRIMARY KEY,
        user_id CHAR(36) NOT NULL,
        badge_type VARCHAR(80) NOT NULL,
        earned_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        expires_at DATETIME
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '021_id_documents',
    sql: `
      CREATE TABLE IF NOT EXISTS id_documents (
        id CHAR(36) PRIMARY KEY,
        verification_id CHAR(36) NOT NULL,
        file_key VARCHAR(500) NOT NULL,
        document_side VARCHAR(20),
        extracted_data JSON,
        created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
  {
    name: '022_newsletter',
    sql: `
      CREATE TABLE IF NOT EXISTS newsletter_subscribers (
        id CHAR(36) PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        consented_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        unsubscribed_at DATETIME NULL,
        ip_address VARCHAR(64)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `,
  },
];
