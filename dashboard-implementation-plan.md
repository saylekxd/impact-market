# Dashboard Enhancement Implementation Plan

This document outlines the approach for implementing the enhanced dashboard features based on the sidebar navigation structure. Each section corresponds to a specific option in the Sidebar.tsx component.

Always check database for existing data and update the database accordingly.

## 1. Profil [Profile] (`/dashboard`)

### Enhance Existing Profile Component
- [x] **Update Profile Header**
  - [x] Add profile completion percentage indicator
  - [x] Implement gamification elements (badges for completed steps)
  - [x] Create visual progress tracker
  - **Prompt**: `Enhance the existing profile component with a completion percentage display, progress visualization, and gamification elements like achievement badges`
  - **DB Query**: `SELECT id, username, display_name, avatar_url, bio FROM profiles WHERE id = ?`

- [x] **Expand Profile Data Management**
  - [x] Enhance profile image upload/management
  - [x] Extend personal information form (name, bio, etc.)
  - [x] Generate shareable public profile link
  - [x] Implement social media connections
  - **Prompt**: `Expand the existing profile data form with image upload, additional personal fields, and social media connection options`
  - **DB Query**: `SELECT id, username, display_name, bio, avatar_url, social_links FROM profiles WHERE id = ?`
  - **DB Update**: `UPDATE profiles SET display_name = ?, bio = ?, avatar_url = ?, social_links = ? WHERE id = ?`
  - **DB Update (New Table)**: `ALTER TABLE profiles ADD COLUMN social_links JSONB`

- [x] **Create Profile Statistics Dashboard**
  - [x] Display key metrics (donations, withdrawals, etc.)
  - [x] Add time-based donation statistics (current month, previous month, last 7 days)
  - [x] Show monthly growth trends with visual indicators
  - [x] Display unique donor counts and recent supporter information
  - [x] Add a simplified notification indicator (placeholder for future notification center)
  - [x] Implement quick actions section
  - **Prompt**: `Build a statistics dashboard component for the profile page that shows key metrics with visual elements`
  - **DB Query**: `SELECT available_balance, total_donations FROM profiles WHERE id = ?`
  - **DB Query**: `SELECT COUNT(*) as payment_count, SUM(amount) as total_received FROM payments WHERE creator_id = ? AND status = 'completed'`
  - **DB Query**: `SELECT COUNT(*) as payout_count, SUM(amount) as total_withdrawn FROM payouts WHERE user_id = ? AND status = 'completed'`
  - **DB Query**: `SELECT created_at, amount FROM payments WHERE creator_id = ? AND status = 'completed' ORDER BY created_at DESC`
  - **DB Query**: `SELECT COUNT(DISTINCT payer_email) as unique_donors FROM payments WHERE creator_id = ? AND status = 'completed'`

## 2. Ikony [Icons] (`/dashboard/icons`)

### Create Icon Selector Component
- [x] **Build Icon Gallery Component**
  - [x] Create grid display of available icons
  - [x] Implement category filtering
  - [x] Add search functionality
  - [x] **Enhance icon variety with additional options**
    - [x] Add 3-4 icons per tier for each category
    - [x] Create a new "Communication" category
    - [x] Ensure meaningful icon selection that aligns with donation values
  - **Prompt**: `Build an icon gallery component with a grid display, category filters, and search to allow users to browse available icons`
  - **DB Query**: `SELECT * FROM icons WHERE is_default = TRUE ORDER BY category, name`

- [x] **Develop Icon Preview Component**
  - [x] Implement live preview functionality
  - [x] Show context-based previews (mobile and desktop views)
  - [x] Create selection/confirmation process
  - [x] **Enhance visual design with minimalistic approach**
    - [x] Simplify interface with more white space and cleaner layout
    - [x] Improve preview visualization with centered icon display
    - [x] Add subtle visual indicators for selected tier
  - **Prompt**: `Develop an icon preview component that shows how selected icons will appear in donation pages`
  - **DB Query**: `SELECT small_icon, medium_icon, large_icon FROM profiles WHERE id = ?`

- [x] **Add Custom Icon Selection**
  - [x] Create icon selection interface
  - [x] Implement tier-based icon selection
  - [x] Add save functionality
  - [x] **Add price customization for each tier**
    - [x] Allow users to set custom prices for small, medium, and large donation options
    - [x] Set recommended default prices to 15, 50, and 100 PLN
    - [x] Implement validation to ensure prices are in ascending order (small < medium < large)
    - [x] Provide visual feedback with real-time preview of prices
    - [x] Ensure prices are properly fetched and displayed in Creator Profile and donation form
  - **Prompt**: `Enhance the icon selector with custom icon selection feature and price customization`
  - **DB Update**: `UPDATE profiles SET small_icon = ?, medium_icon = ?, large_icon = ?, small_coffee_amount = ?, medium_coffee_amount = ?, large_coffee_amount = ? WHERE id = ?`

## 3. Wypłaty [Withdraws] (`/dashboard/withdraws`)

### Build Withdrawal Management System
- [x] **Create Verification Status Gate**
  - [x] Implement KYC verification check
  - [x] Add bank account validation
  - [x] Create user guidance for incomplete prerequisites
  - **Prompt**: `Build a verification status component that blocks withdrawal functionality until requirements are met`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS user_verifications (
      user_id UUID PRIMARY KEY REFERENCES profiles(id),
      kyc_status TEXT,
      kyc_reference TEXT,
      kyc_completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  - **DB Query**: `SELECT COUNT(*) FROM bank_accounts WHERE user_id = ?`
  - **DB Query**: `SELECT kyc_status FROM user_verifications WHERE user_id = ?`

- [x] **Develop Withdrawal Request Form**
  - [x] Create amount input with validation
  - [x] Implement bank account selector
  - [x] Add confirmation step
  - **Prompt**: `Create a withdrawal request form component with amount validation and confirmation process`
  - **DB Query**: `SELECT id, bank_name, account_number FROM bank_accounts WHERE user_id = ?`
  - **DB Query**: `SELECT available_balance FROM profiles WHERE id = ?`
  - **DB Update**: `INSERT INTO payouts (id, user_id, amount, bank_account_id, status, created_at) VALUES (?, ?, ?, ?, 'pending', NOW())`

- [ X] **Build Withdrawal History Component**
  - [X] Implement filterable/searchable table
  - [X] Create status indicators
  - [X] Add detailed view for each transaction
  - **Prompt**: `Enhance the existing financial history component to show withdrawal history with filtering and status indicators`
  - **DB Query**: `SELECT p.*, b.bank_name, b.account_number 
                  FROM payouts p 
                  JOIN bank_accounts b ON p.bank_account_id = b.id 
                  WHERE p.user_id = ? 
                  ORDER BY p.created_at DESC 
                  LIMIT ? OFFSET ?`

- [x] **Create Withdrawal Statistics**
  - [x] Implement total withdrawn metric
  - [x] Add time-based charts
  - [x] Create pending withdrawals overview
  - **Prompt**: `Build a withdrawal statistics dashboard with metrics and visualizations`
  - **DB Query**: `SELECT 
                  SUM(CASE WHEN status = 'completed' THEN amount ELSE 0 END) as total_completed,
                  SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as total_pending,
                  COUNT(CASE WHEN status = 'pending' THEN 1 END) as count_pending
                  FROM payouts 
                  WHERE user_id = ?`
  - **DB Query**: `SELECT DATE_TRUNC('month', created_at) as month, SUM(amount) as amount
                  FROM payouts
                  WHERE user_id = ? AND status = 'completed'
                  GROUP BY DATE_TRUNC('month', created_at)
                  ORDER BY month DESC
                  LIMIT 12`

## 4. Darowizny [Donations] (`/dashboard/donations`)

### Create Donation Management System
- [x] **Build Donations Overview Component**
  - [x] Create total/recent donations metrics
  - [x] Implement trend visualization
  - [x] Add donor count statistics
  - **Prompt**: `Develop a donations overview component using the existing statistics component as a base`
  - **DB Query**: `SELECT total_donations, available_balance FROM profiles WHERE id = ?`
  - **DB Query**: `SELECT COUNT(DISTINCT payer_email) as unique_donors FROM payments WHERE creator_id = ? AND status = 'completed'`
  - **DB Query**: `SELECT DATE_TRUNC('day', created_at) as day, SUM(amount) as amount
                  FROM payments
                  WHERE creator_id = ? AND status = 'completed'
                  GROUP BY DATE_TRUNC('day', created_at)
                  ORDER BY day DESC
                  LIMIT 30`

- [ ] **Implement Top Donors Feature**
  - [ ] Create sortable donor leaderboard
  - [ ] Add public-facing display option
  - [ ] Implement donor recognition features
  - **Prompt**: `Build a top donors component that showcases the most generous supporters`
  - **DB Query**: `SELECT payer_name, payer_email, SUM(amount) as total_donated, COUNT(*) as donation_count
                  FROM payments
                  WHERE creator_id = ? AND status = 'completed'
                  GROUP BY payer_name, payer_email
                  ORDER BY total_donated DESC
                  LIMIT 10`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS donor_visibility (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES profiles(id),
      show_top_donors BOOLEAN DEFAULT TRUE,
      top_donors_count INTEGER DEFAULT 5,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`

- [ ] **Enhance Donation History Component**
  - [ ] Improve existing table with filtering
  - [ ] Add detailed donor information display
  - [ ] Implement message/note visualization
  - **Prompt**: `Enhance the existing donation history component with advanced filtering and detailed views`
  - **DB Query**: `SELECT id, created_at, amount, payer_name, payer_email, payment_type, message, status
                  FROM payments
                  WHERE creator_id = ?
                  ORDER BY created_at DESC
                  LIMIT ? OFFSET ?`

- [ ] **Add Donation Goals Feature**
  - [ ] Create goal setting interface
  - [ ] Implement progress visualization
  - [ ] Add milestone notifications
  - **Prompt**: `Develop a donation goals system that works with the existing finance components`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS donation_goals (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES profiles(id),
      title TEXT,
      description TEXT,
      target_amount INTEGER,
      current_amount INTEGER DEFAULT 0,
      start_date TIMESTAMPTZ,
      end_date TIMESTAMPTZ,
      active BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  - **DB Query**: `SELECT * FROM donation_goals WHERE user_id = ? AND active = TRUE`
  - **DB Update**: `INSERT INTO donation_goals (id, user_id, title, description, target_amount, start_date, end_date, active) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`

## 5. Dokumenty [Documents] (`/dashboard/documents`)

### Create Document Management System
- [ ] **Build Document Categories Component**
  - [ ] Create category navigation structure
  - [ ] Implement required vs. optional indicators
  - [ ] Add document count per category
  - **Prompt**: `Build a document categories navigation component with status indicators`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS documents (
      id UUID PRIMARY KEY,
      user_id UUID REFERENCES profiles(id),
      file_name TEXT,
      file_path TEXT,
      file_type TEXT,
      file_size INTEGER,
      category TEXT,
      status TEXT DEFAULT 'pending',
      uploaded_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  - **DB Query**: `SELECT category, COUNT(*) as doc_count FROM documents WHERE user_id = ? GROUP BY category`

- [ ] **Implement Document Upload Component**
  - [ ] Create drag-and-drop interface
  - [ ] Add file type validation
  - [ ] Implement progress indicators
  - **Prompt**: `Develop a document upload component with drag-and-drop functionality and validation`
  - **DB Update**: `INSERT INTO documents (id, user_id, file_name, file_path, file_type, file_size, category, status) 
                  VALUES (?, ?, ?, ?, ?, ?, ?, 'pending')`

- [ ] **Create Document Management Interface**
  - [ ] Implement document listing with filters
  - [ ] Add status indicators for each document
  - [ ] Create preview/download functionality
  - **Prompt**: `Create a document management interface that lists all user documents with status and actions`
  - **DB Query**: `SELECT * FROM documents WHERE user_id = ? AND category = ? ORDER BY uploaded_at DESC`

## 6. Ustawienia [Preferences] (`/dashboard/settings`)

### Enhance Existing Settings Component
- [ ] **Extend Notification Settings**
  - [ ] Add toggles for different notification types
  - [ ] Implement frequency controls
  - [ ] Create channel selection options
  - **Prompt**: `Enhance the existing settings component with expanded notification preferences`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS user_notification_settings (
      user_id UUID PRIMARY KEY REFERENCES profiles(id),
      email_notifications BOOLEAN DEFAULT TRUE,
      donation_notifications BOOLEAN DEFAULT TRUE,
      withdrawal_notifications BOOLEAN DEFAULT TRUE,
      marketing_notifications BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  - **DB Query**: `SELECT * FROM user_notification_settings WHERE user_id = ?`
  - **DB Update**: `INSERT INTO user_notification_settings (user_id, email_notifications, donation_notifications, withdrawal_notifications, marketing_notifications)
                  VALUES (?, ?, ?, ?, ?)
                  ON CONFLICT (user_id) DO UPDATE SET
                  email_notifications = ?,
                  donation_notifications = ?,
                  withdrawal_notifications = ?,
                  marketing_notifications = ?,
                  updated_at = NOW()`

- [ ] **Add Privacy Controls**
  - [ ] Implement profile visibility options
  - [ ] Create data sharing preferences
  - [ ] Add third-party connection management
  - **Prompt**: `Extend the settings component with privacy control options`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS user_privacy_settings (
      user_id UUID PRIMARY KEY REFERENCES profiles(id),
      profile_visibility TEXT DEFAULT 'public',
      show_donation_amounts BOOLEAN DEFAULT TRUE,
      show_donation_messages BOOLEAN DEFAULT TRUE,
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  - **DB Query**: `SELECT * FROM user_privacy_settings WHERE user_id = ?`
  - **DB Update**: `INSERT INTO user_privacy_settings (user_id, profile_visibility, show_donation_amounts, show_donation_messages)
                  VALUES (?, ?, ?, ?)
                  ON CONFLICT (user_id) DO UPDATE SET
                  profile_visibility = ?,
                  show_donation_amounts = ?,
                  show_donation_messages = ?,
                  updated_at = NOW()`

- [ ] **Create Display Preferences**
  - [ ] Add theme selection
  - [ ] Implement layout options
  - [ ] Create accessibility settings
  - **Prompt**: `Add display preference controls to the settings component`
  - **DB Update (New Table)**: `CREATE TABLE IF NOT EXISTS user_display_settings (
      user_id UUID PRIMARY KEY REFERENCES profiles(id),
      theme TEXT DEFAULT 'dark',
      layout_preference TEXT DEFAULT 'standard',
      created_at TIMESTAMPTZ DEFAULT NOW(),
      updated_at TIMESTAMPTZ DEFAULT NOW()
    )`
  - **DB Query**: `SELECT * FROM user_display_settings WHERE user_id = ?`
  - **DB Update**: `INSERT INTO user_display_settings (user_id, theme, layout_preference)
                  VALUES (?, ?, ?)
                  ON CONFLICT (user_id) DO UPDATE SET
                  theme = ?,
                  layout_preference = ?,
                  updated_at = NOW()`

## Sidebar Enhancement (`src/pages/dashboard/components/Sidebar.tsx`)

### Update Sidebar Component
- [ ] **Extend Sidebar Navigation**
  - [ ] Add all new menu items
  - [ ] Implement active state styling
  - [ ] Create responsive behavior
  - **Prompt**: `Update the existing Sidebar.tsx component to include all six navigation options with proper active state styling`
  - **Code Update**: 
  ```tsx
  // Updated menuItems array with all six options
  const menuItems = [
    { name: 'Profil', icon: <UserCircle className="h-5 w-5" />, path: '/dashboard' },
    { name: 'Ikony', icon: <Image className="h-5 w-5" />, path: '/dashboard/icons' },
    { name: 'Wypłaty', icon: <Wallet className="h-5 w-5" />, path: '/dashboard/withdraws' },
    { name: 'Darowizny', icon: <Heart className="h-5 w-5" />, path: '/dashboard/donations' },
    { name: 'Dokumenty', icon: <FileText className="h-5 w-5" />, path: '/dashboard/documents' },
    { name: 'Ustawienia', icon: <Settings className="h-5 w-5" />, path: '/dashboard/settings' }
  ];
  ```

- [ ] **Implement Mobile Responsiveness**
  - [ ] Create collapsible sidebar for medium screens
  - [ ] Implement bottom navigation for mobile
  - [ ] Add responsive behavior logic
  - **Prompt**: `Enhance the Sidebar component with responsive design for various screen sizes` 

## Additional Requirements

### KYC Verification Implementation

We need to implement a full KYC (Know Your Customer) ID verification process that is required by Polish law for financial transactions. This verification should be:

1. **Comprehensive** - Including identity verification through official documents, proof of address, and potentially biometric verification
2. **Compliant with Polish Financial Regulations** - Meeting all requirements of Polish AML (Anti-Money Laundering) and financial transaction laws
3. **Integrated with External Provider** - Implementation should leverage a trusted external KYC provider specializing in Polish market compliance
4. **User-Friendly** - The verification process should be as smooth and straightforward as possible while maintaining compliance
5. **Secure** - All sensitive personal data must be handled with appropriate security measures

This is a critical component for the withdrawal functionality as Polish law requires proper verification of individuals before processing financial transactions.

### Payout System Implementation

The payout system needs to be implemented with the following key components and features:

1. **Admin Panel for Payout Management**
   - Create administrative interface for reviewing and processing payout requests
   - Implement status change flow (pending → processing → completed/rejected)
   - Add admin comments and transaction reference tracking
   - Implement batch processing capabilities for multiple payouts

2. **Transaction Security**
   - Implement multi-level approval for payout requests above certain thresholds
   - Add fraud detection mechanisms for suspicious withdrawal patterns
   - Create IP and device logging for all payout-related actions
   - Implement admin action audit trail for all payout status changes

3. **Financial Reconciliation**
   - Create automated balance updates following successful payouts
   - Implement financial reports for accounting purposes
   - Add transaction categorization for financial reporting
   - Create exportable financial summaries for tax purposes

4. **User-Facing Features**
   - Enhanced payout history with detailed status information
   - Email notifications for each stage of the payout process
   - Payout receipt generation for completed transactions
   - Cancellation options for pending payout requests

5. **Integration with Banking Systems**
   - Develop secure API connections to banking partners for automated transfers
   - Implement bank verification system for new account validation
   - Add support for multiple payout methods (bank transfer, PayPal, etc.)
   - Create retry mechanisms for failed banking transactions

6. **Compliance Features**
   - Implement transaction limits based on user verification level
   - Add suspicious activity reporting mechanisms
   - Create compliance reports for regulatory submissions
   - Implement data retention policies compliant with financial regulations

7. **Testing and Validation**
   - Create comprehensive test plan covering all payout scenarios
   - Develop sandbox environment for testing banking integrations
   - Implement automated testing for critical payout flows
   - Conduct security penetration testing on the entire payout system

8. **Documentation and Training**
   - Create detailed internal documentation for payout processing
   - Develop admin training materials for payout system
   - Create user documentation and FAQs for payout process
   - Implement contextual help within the payout interface

This implementation must comply with Polish financial regulations and ensure secure, reliable transfer of funds to creators while maintaining appropriate financial controls and audit capabilities. 