# Project Summary: Impact Market (Creator Donation Platform)

## 1. Project Goal

The project aims to build a platform enabling creators (individuals, businesses, non-profits) to receive financial support (donations) from their audience. It appears similar in concept to platforms like "Buy Me a Coffee" or "Patreon", but with a unique feature allowing creators to customize three tiers of support represented by icons and specific monetary values (in PLN).

## 2. Core Features

### Implemented / In Progress:

*   **User Authentication:** Handled via Supabase Auth (implied).
*   **Onboarding Flow:**
    *   Account Type Selection (Individual, Business, Non-Profit, Creator).
    *   Personal/Organization Data Collection (Name, Address, Phone, NIP/KRS, Category, etc.) with validation for Polish formats.
    *   Phone Number Verification (Component exists, integration details TBC).
    *   Icon & Price Selection: Allows creators to choose icons representing 3 tiers (Small, Medium, Large) and set custom prices for each tier (input validation added).
    *   Bank Account Setup: Form for users to input bank details (IBAN, Bank Name, SWIFT) for payouts (validation added).
*   **Creator Dashboard (`/dashboard/*`):**
    *   **Profile:** View/edit basic profile info (name, bio, avatar - planned enhancements include completion % and gamification).
    *   **Icons (`/dashboard/icons`):** Manage icon selections and prices for the 3 donation tiers. Includes an icon gallery and preview.
    *   **Withdrawals (`/dashboard/withdraws`):** (Partially implemented) Shows bank account info, likely intended for initiating payouts and viewing history. Requires KYC verification (planned).
    *   **Donations (`/dashboard/donations`):** (Planned) Overview of received donations, top donors, history.
    *   **Documents (`/dashboard/documents`):** (Planned) For uploading necessary documents (likely for KYC).
    *   **Settings (`/dashboard/settings`):** (Planned) Notification, privacy, display preferences.
*   **Database (Supabase):** Tables for `profiles`, `personal_data`, `bank_accounts`, `payments`, `payouts`, `icons`, `donation_goals`, various settings tables, etc.

### Planned / To Be Implemented:

*   **Public Creator Profile Page (`/creator/[username]`):** The public-facing page where users can donate (subject of the plan below).
*   **Full KYC Verification:** Integration with an external provider compliant with Polish regulations.
*   **Payout System:** Admin panel for processing payouts, security features, reconciliation, notifications.
*   **Payment Gateway Integration:** Primarily Stripe (based on `DonationStripeForm.tsx`) for handling incoming donations on the creator page.
*   **Gamification:** Donation goals, supporter leaderboards, profile completion badges.
*   **Notifications:** Email/in-app notifications for donations, payouts, etc.

## 3. Technology Stack (Inferred)

*   **Frontend:** React, TypeScript
*   **Routing:** React Router
*   **Styling:** Tailwind CSS
*   **UI Components:** Shadcn UI (likely, based on components and style), Lucide Icons
*   **Animation:** Framer Motion
*   **Backend & DB:** Supabase (Auth, Database, possibly Storage)
*   **Payments:** Stripe (likely)

## 4. Current Focus (Based on recent activity)

*   Fixing bugs in the onboarding flow (Icon selection, Bank account, Data validation).
*   Planning the public creator profile page.

--- 