# Hotel Back-office

Back-office for a hotel chain: front-office staff manage reservations, rooms and content in the User View; administrators manage properties and staff accounts in the Admin View.

## Language

### People and access

**User**:
A staff account that can sign in to the back-office. Every User belongs to the chain, not to a single Property.
_Avoid_: Account, staff member

**Guest**:
A person staying at a Property. Never signs in to the back-office. Distinct from [[user]] in every respect — the two are separate tables and separate concepts.
_Avoid_: Customer, client

**Administrator**:
A User whose `is_admin` flag is true. **This flag is the only thing that grants elevated access anywhere in the system.**
_Avoid_: Superadmin, admin user

**Role**:
A label attached to a User (`Administrators`, `Housekeeping Manager`, `Tester`, …). **Roles carry no permissions.** Nothing in the backend reads a role name when deciding whether a request is allowed — authorisation asks only whether the User is an [[administrator]]. The role named `Administrators` is therefore *not* what makes someone an Administrator; it is a label that happens to share the name.
_Avoid_: Permission, group

**Property**:
A single hotel in the chain. A User has one *selected* Property at a time, which scopes what the User View shows.
_Avoid_: Hotel, site, location

### Identity and security

**Profile**:
A User's view of their own record — the self-service surface for name, avatar, password and two-factor authentication. Distinct from the *User record* that an Administrator edits under Admin View: same row in the database, different authority and different rules.

**Section**:
One card on the Profile page that owns its own save. Sections save independently; there is no page-level save. A section with unsaved edits is *dirty*.

**Verified email**:
An email address the User has proved control of by following a link from a [[verification-token]]. Unverified Users cannot sign in.

**Verification token**:
A single-use, expiring secret mailed to a User to prove control of an address or to authorise a reset. Comes in three kinds — `verification`, `invitation`, `reset` — and is spent by stamping `used_at`.
_Avoid_: Link, code

**Two-factor authentication (2FA)**:
A second sign-in step in which the User enters a time-based 6-digit code from an authenticator app. Always TOTP in this system; no SMS, no email codes.

**Recovery code**:
A single-use secret that substitutes for a TOTP code when the User has lost their authenticator. Issued as a batch of ten, shown exactly once, stored hashed.
_Avoid_: Backup code, one-time password

**Fresh authentication**:
Having proved knowledge of the password within the last 15 minutes. Security-sensitive operations (enabling or disabling 2FA, regenerating recovery codes) require it; a merely valid session is not enough.
_Avoid_: Reauthentication, step-up auth
