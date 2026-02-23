## [1.14.1](https://github.com/riedel28/hotel-dashboard/compare/v1.14.0...v1.14.1) (2026-02-23)


### Bug Fixes

* **theme:** update theme-color to match primary brand color ([917f0d8](https://github.com/riedel28/hotel-dashboard/commit/917f0d8c987d4317085efb0854407479402fffda))

# [1.14.0](https://github.com/riedel28/hotel-dashboard/compare/v1.13.1...v1.14.0) (2026-02-17)


### Bug Fixes

* **i18n:** add missing German translations and update rooms sidebar icon ([5a7e2e7](https://github.com/riedel28/hotel-dashboard/commit/5a7e2e7c9dd7e665a1a07236edfe021afe6a39dd))
* **lint:** sort import order in dashboard layout ([58a1cf1](https://github.com/riedel28/hotel-dashboard/commit/58a1cf1e334d45f60b800dc2f87601ad6e406b2c))


### Features

* **dashboard:** update index cards to reservations, rooms, users, and monitoring ([e1d923b](https://github.com/riedel28/hotel-dashboard/commit/e1d923b0132d1ffb685866112d242d75dc19b56a))

## [1.13.1](https://github.com/riedel28/hotel-dashboard/compare/v1.13.0...v1.13.1) (2026-02-16)


### Bug Fixes

* **ci:** add tests, fix lint, improve caching and release workflow ([4b1c57b](https://github.com/riedel28/hotel-dashboard/commit/4b1c57be8e4d28fbed03e30bbd5da961cd25103f))
* **ci:** disable rate limiting in test environment ([477a698](https://github.com/riedel28/hotel-dashboard/commit/477a698bb541e3f63177f905789f9507ffe7a9e7))
* **ci:** fix E2E seed failure and speed up backend test setup ([e8505b8](https://github.com/riedel28/hotel-dashboard/commit/e8505b81f263e4baaaddcf6f9a4a7a5e918712ec))
* **ci:** remove unsupported cache params from setup-bun ([e899b85](https://github.com/riedel28/hotel-dashboard/commit/e899b8567a582faf719bec60d7ebc6e2ef9070a4))
* **ci:** serialize E2E after test job to prevent DB conflicts ([b85f5a6](https://github.com/riedel28/hotel-dashboard/commit/b85f5a641ce37fddb5b0159ec7745b5a451e45e2))
* **deploy:** update Vercel API rewrite to proxy through Fly.io ([9028bcf](https://github.com/riedel28/hotel-dashboard/commit/9028bcfb40025195e082dba2ab3e48c90e674c83))
* **e2e:** increase auth setup timeout for CI cold starts ([caaa7e7](https://github.com/riedel28/hotel-dashboard/commit/caaa7e7e06251ba2d9e266624f4a8c0018565d68))
* **e2e:** increase timeout for room table refresh after creation ([291253f](https://github.com/riedel28/hotel-dashboard/commit/291253fa0759edb8ae9825af20c8a6d03a8cd2af))
* **e2e:** use search filter after room creation to handle pagination ([f43eae3](https://github.com/riedel28/hotel-dashboard/commit/f43eae3eee3abca5ab995e42b50e681bad4b209b))
* **e2e:** use search filters in edit/user tests to handle pagination ([9aada99](https://github.com/riedel28/hotel-dashboard/commit/9aada99c99ec98c469518717a91801ac1a36ae28))
* **e2e:** use search input for user filtering instead of URL params ([e9c0a6c](https://github.com/riedel28/hotel-dashboard/commit/e9c0a6ce09a677a6a871580e725466976514ba3c))
* **e2e:** wait for rooms refetch before asserting table content ([07b4bdc](https://github.com/riedel28/hotel-dashboard/commit/07b4bdc1a3dee9f6b92f9b391d4f61689f17339e))
* **ux:** add loading screen for cold-start backend wake-up ([fa6dea8](https://github.com/riedel28/hotel-dashboard/commit/fa6dea8da0814cb27e690dcf6b7bb3ed23bc9a71))
* **ux:** remove initial loading spinner from root div ([ded63db](https://github.com/riedel28/hotel-dashboard/commit/ded63db8e10b946d44e30c0eefd2b1dbb67b341f))


### Performance Improvements

* **ci:** skip redundant type-check in build step ([f524ab5](https://github.com/riedel28/hotel-dashboard/commit/f524ab545f33994c65c427297735a27a38c30327))

# [1.13.0](https://github.com/riedel28/hotel-dashboard/compare/v1.12.0...v1.13.0) (2026-02-16)


### Bug Fixes

* **ci:** add VITE_API_BASE_URL env and cache Playwright browsers ([4252fab](https://github.com/riedel28/hotel-dashboard/commit/4252fab13e0b07a66d7341a661fabc874ffa0e62))
* **e2e:** fix all e2e tests and move credentials to env ([38e4638](https://github.com/riedel28/hotel-dashboard/commit/38e46389c45f38b75c4ce5e24875cd2381e62681))


### Features

* **ci:** add E2E testing workflow with Playwright ([1fb7a90](https://github.com/riedel28/hotel-dashboard/commit/1fb7a908e8fb919e8eb5c65498f56064fd61baf9))
* **countries:** add reusable country utilities and components ([e574277](https://github.com/riedel28/hotel-dashboard/commit/e574277c9a3db078d4b6945eed0c1cf411d64084))


### Performance Improvements

* **ci:** run only Chromium E2E in CI, reduce retries to 1 ([53ded22](https://github.com/riedel28/hotel-dashboard/commit/53ded220fb7479490becbda3f125366dec0e8a34))

# [1.12.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.11.2...v1.12.0) (2026-02-14)


### Bug Fixes

* **branding:** update favicon to match sidebar logo icon ([3328718](https://github.com/riedel28/tanstack-dashboard/commit/332871827312da0a0726ee88d64f12a0e41d87d0))
* **css:** remove duplicate rules in globals.css ([9244aa0](https://github.com/riedel28/tanstack-dashboard/commit/9244aa0c0b6f5888022cb72de6b9370ee0eff1e2))
* **header:** prevent property selector from overflowing header width ([55a5fa6](https://github.com/riedel28/tanstack-dashboard/commit/55a5fa6d7a46487cdeaedc89ac97db8e74e09526))
* **i18n:** update German locale files for consistency and accuracy ([cbf2491](https://github.com/riedel28/tanstack-dashboard/commit/cbf24911968b0dd38c90abdfe710254fa7f2c1c1))
* **reservations:** prevent guest disappearing on edit and add email field to add-guest modal ([47bedc2](https://github.com/riedel28/tanstack-dashboard/commit/47bedc2c948d6e40571e2753f6b381bdc8007d5e))
* **reservations:** use real room data in room selectors ([85c90ee](https://github.com/riedel28/tanstack-dashboard/commit/85c90eec7f70ca059a1b57c6fab8af533cf11086))
* **responsive:** improve auth and profile page layouts across breakpoints ([3b43ead](https://github.com/riedel28/tanstack-dashboard/commit/3b43ead00ec394649a994f5bf9ee65a545690b02))
* **rooms:** default property_id to selected property in add room modal ([97e6e53](https://github.com/riedel28/tanstack-dashboard/commit/97e6e53bb89b9a7f6b821513e7faa16225a956ea))
* **ui:** improve dark mode styling across components ([aa41fdc](https://github.com/riedel28/tanstack-dashboard/commit/aa41fdcc62c7b201c1bafc1573b3b523d5ea13cb))


### Features

* **a11y:** introduce comprehensive accessibility compliance skill ([ab46583](https://github.com/riedel28/tanstack-dashboard/commit/ab465833dae8bdcbd6647178fa1a347bd5846011))
* **monitoring:** redesign status indicators with pulse animation ([92d2b84](https://github.com/riedel28/tanstack-dashboard/commit/92d2b847d9754552af98ae179aa8548379c83ca2))
* **reservations:** add guest search backend endpoint ([43ac5d2](https://github.com/riedel28/tanstack-dashboard/commit/43ac5d2a9abd6936c9e426ab446e5b3e15652a3b))
* **reservations:** add guest search combobox to edit reservation form ([4337a3c](https://github.com/riedel28/tanstack-dashboard/commit/4337a3c40a8dc90b64410ac0d8c98f292c2f67e4))
* **seo:** add dynamic document titles to all routes ([8e810a2](https://github.com/riedel28/tanstack-dashboard/commit/8e810a2cad90de3494ab1a59d013cfe9abae6855))
* **seo:** add dynamic lang attribute and lazy loading for images ([5802346](https://github.com/riedel28/tanstack-dashboard/commit/5802346179ed9a0d33eb4900a06fca484099921f))
* **theme:** add dark mode support with ThemeProvider ([5ec0821](https://github.com/riedel28/tanstack-dashboard/commit/5ec082142a8bdce4b0e428db53f0ab1b00e97af9))
* **ui:** add autocomplete component based on @base-ui/react ([0cdbdee](https://github.com/riedel28/tanstack-dashboard/commit/0cdbdee4074e5c343ba489c24e99582dce2fc677))


### Performance Improvements

* **auth:** optimize login background image ([869c0a9](https://github.com/riedel28/tanstack-dashboard/commit/869c0a947d415fc5d56201127526709cf366dcd6))
* **backend:** add compression middleware for API responses ([159f367](https://github.com/riedel28/tanstack-dashboard/commit/159f367a91c5cdbfe3fcaf8fbb226d2762972eef))
* **build:** add vendor chunk splitting and enable CSS code splitting ([2a335fd](https://github.com/riedel28/tanstack-dashboard/commit/2a335fd100ce3fc61f668a62f854bb15feeccf8c))
* preload LCP image for faster desktop paint ([e2a8282](https://github.com/riedel28/tanstack-dashboard/commit/e2a82821e2eccf3e9ccd0b30ff47e3565544ec7d))
* **reservations:** remove @hookform/devtools from production bundle ([451d444](https://github.com/riedel28/tanstack-dashboard/commit/451d444ca729729da752a240769cb7520db56f57))

## [1.11.2](https://github.com/riedel28/tanstack-dashboard/compare/v1.11.1...v1.11.2) (2026-02-11)


### Bug Fixes

* **auth:** proxy API through Vercel to fix Safari login ([a9f1e6c](https://github.com/riedel28/tanstack-dashboard/commit/a9f1e6c5fac21adaa4c268d249320ff3649de1f2))


### Reverts

* **auth:** remove flushSync — was misdiagnosed fix ([736f908](https://github.com/riedel28/tanstack-dashboard/commit/736f908f0256b3c23b0434a9eee35e464a84f5a6))

## [1.11.1](https://github.com/riedel28/tanstack-dashboard/compare/v1.11.0...v1.11.1) (2026-02-11)


### Bug Fixes

* **auth:** ensure user state updates synchronously during login ([9612af6](https://github.com/riedel28/tanstack-dashboard/commit/9612af6e2ac9aab7b36fa1679071fd8f3570838d))

# [1.11.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.10.0...v1.11.0) (2026-02-11)


### Bug Fixes

* **sidebar:** fix active state for Start link and remove customers item ([df90384](https://github.com/riedel28/tanstack-dashboard/commit/df90384f02bc3f48306bb6811014aff8b0a6ac95))


### Features

* **db:** update property schema and migrations ([1a278de](https://github.com/riedel28/tanstack-dashboard/commit/1a278de3ea46b970851814daedfe198db433baed))
* **properties:** add create property modal ([f0e5163](https://github.com/riedel28/tanstack-dashboard/commit/f0e5163905590f67ac30313bb627b6cebda2cf65))
* **properties:** add CRUD, filters, and sorting for properties page ([3f88e73](https://github.com/riedel28/tanstack-dashboard/commit/3f88e733cb8841ba20368385ef19c1f86779a63c))

# [1.10.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.9.0...v1.10.0) (2026-02-10)


### Bug Fixes

* **auth:** remove empty redirect param from login URL ([7b90e0d](https://github.com/riedel28/tanstack-dashboard/commit/7b90e0d55765ff5dcc912e9a2e7bc94cfd5769b9))
* **server:** enable trust proxy in production for rate limiter ([e7bdf14](https://github.com/riedel28/tanstack-dashboard/commit/e7bdf143e9984f193a55d02109bdf8a46a348f2a))


### Features

* **auth:** add forgot-password and reset-password endpoints ([e4fedc4](https://github.com/riedel28/tanstack-dashboard/commit/e4fedc414ce8286cb69c1c87f54b56e1b996b337))
* **auth:** wire up forgot-password page and add reset-password page ([684867f](https://github.com/riedel28/tanstack-dashboard/commit/684867f71d0884b9025598cd05d232e06cbf59fe))
* **db:** add 'reset' token type to email verification tokens ([99af6ad](https://github.com/riedel28/tanstack-dashboard/commit/99af6ad9b19123fcec0fde79eefd6ac5b12af953))
* **email:** add password reset email template and fix button colors ([c9fd873](https://github.com/riedel28/tanstack-dashboard/commit/c9fd873bcee046217567b6a6cc1203b1ac1e234c)), closes [#18181](https://github.com/riedel28/tanstack-dashboard/issues/18181) [#1e3a8](https://github.com/riedel28/tanstack-dashboard/issues/1e3a8)

# [1.9.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.8.0...v1.9.0) (2026-02-10)


### Bug Fixes

* **auth:** format verification controller for biome check ([e931216](https://github.com/riedel28/tanstack-dashboard/commit/e931216008cfc36cb2c882479682e568cb218866))


### Features

* **auth:** set up SMTP email delivery and fix verify-email flow ([9f72828](https://github.com/riedel28/tanstack-dashboard/commit/9f72828c127a783c1854a80a31c5ab19dffe50d6))

# [1.8.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.7.1...v1.8.0) (2026-02-09)


### Features

* **admin-layout:** enhance admin routing and remove deprecated view context ([2524129](https://github.com/riedel28/tanstack-dashboard/commit/25241292d1e547e0796bce407ab9d90916797c61))

## [1.7.1](https://github.com/riedel28/tanstack-dashboard/compare/v1.7.0...v1.7.1) (2026-02-09)


### Bug Fixes

* **backend:** add @epic-web/remember to backend dependencies ([fc0707e](https://github.com/riedel28/tanstack-dashboard/commit/fc0707e3615f0587763b31237e43c1b6273788e1))

# [1.7.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.6.1...v1.7.0) (2026-02-09)


### Bug Fixes

* **backend:** use SQL count() instead of fetching all rows for pagination ([f4fdcb9](https://github.com/riedel28/tanstack-dashboard/commit/f4fdcb900d5ad6b082c2bacb90b6e2aee4a0e30a))
* format vercel.json for Biome ([a62508a](https://github.com/riedel28/tanstack-dashboard/commit/a62508a9e907d815fc26671de4dace8373bff6b4))
* **frontend:** improve error handling in sign-up process ([76c3f0c](https://github.com/riedel28/tanstack-dashboard/commit/76c3f0c55f3ccd4dbe9ad58142e38b02cfa88971))
* **frontend:** read correct error key in API error handler ([a510fc8](https://github.com/riedel28/tanstack-dashboard/commit/a510fc80128ffff814bd853107f205dc58830ac2))
* **frontend:** tree-shake devtools, fix stale hook, remove dead code ([1d065de](https://github.com/riedel28/tanstack-dashboard/commit/1d065de5a2241eb37ee749196a2ea65e2a039f7c))
* **profile:** replace fake success toasts and fix module-scope t macro ([97b84f9](https://github.com/riedel28/tanstack-dashboard/commit/97b84f9e0eba2c3f5838b34509c2ff7747aa138b))
* resolve TypeScript error and update Biome schema version ([ef0cdd0](https://github.com/riedel28/tanstack-dashboard/commit/ef0cdd00e81722fac4bc3ea6a52403dd6e8b6e1c))
* **security:** add admin route guards and harden auth state ([fcf4dd2](https://github.com/riedel28/tanstack-dashboard/commit/fcf4dd2bb03b4e4b29c7a26ae5efba5bf1db5c2c))
* **security:** deduplicate and fix LIKE pattern escaping ([3ec41b6](https://github.com/riedel28/tanstack-dashboard/commit/3ec41b6d693cc863d04bd73051bccf8d8f4a5096))
* **security:** harden backend validation and runtime config ([4eb29a6](https://github.com/riedel28/tanstack-dashboard/commit/4eb29a6d241e18100a67d52043ce357061e6def3))
* **security:** prevent password hash exposure and use validated bcrypt rounds ([d02652a](https://github.com/riedel28/tanstack-dashboard/commit/d02652abe3f8b0bc5b002c2e3afaab7b05ae396c))
* **security:** remove hardcoded credentials, fix open redirect, remove password logging ([4b0369d](https://github.com/riedel28/tanstack-dashboard/commit/4b0369d7af0b92bb65142bd0b8b295a2ce0d7268))
* **security:** require admin auth for user registration ([bf2ae91](https://github.com/riedel28/tanstack-dashboard/commit/bf2ae912a1c4c0eb502ff20ea98599f2df242180))
* **security:** restrict CORS to configured origins ([fa58192](https://github.com/riedel28/tanstack-dashboard/commit/fa581928f6dba4f1a9c6769d0163018327519984))


### Features

* **auth:** migrate JWT auth to httpOnly cookies and add logout endpoint ([ad68c28](https://github.com/riedel28/tanstack-dashboard/commit/ad68c2865b7d27a9ed077f2f65ae1b9229a9661c))
* **backend:** add email verification and user invitation system ([d2f81e5](https://github.com/riedel28/tanstack-dashboard/commit/d2f81e548f1fbcf743f4692c9a3cff8fc00facfd))
* **frontend:** add email verification and invitation flows ([4d3baa9](https://github.com/riedel28/tanstack-dashboard/commit/4d3baa9e4966a763ec57f0443d494e5d7a1c7a7b))
* **security:** add authorization middleware and protect routes ([087c00a](https://github.com/riedel28/tanstack-dashboard/commit/087c00aaa0c554df16ed860d0aac0081c66b69a3))
* **security:** add helmet, rate limiting, and request body size limit ([ef23120](https://github.com/riedel28/tanstack-dashboard/commit/ef23120b929dbdb695010a6826fe4b3710ea9270))

## [1.6.1](https://github.com/riedel28/tanstack-dashboard/compare/v1.6.0...v1.6.1) (2026-02-07)


### Bug Fixes

* **routes:** standardize route paths by adding trailing slashes for consistency ([332300f](https://github.com/riedel28/tanstack-dashboard/commit/332300f6dfb1f0032f9904e721006bbf631298c8))

# [1.6.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.5.0...v1.6.0) (2026-02-04)


### Bug Fixes

* add object constraint to DataGridTableDndRow ([b2b961c](https://github.com/riedel28/tanstack-dashboard/commit/b2b961c49c854cbbe458ee8d38bbb3d9e8a5e248))
* **auth:** enforce authentication check in dashboard loader ([1800e7d](https://github.com/riedel28/tanstack-dashboard/commit/1800e7d2649bd2a5422ab370c4376f630e5f89c6))
* **ci:** add Node.js 22 setup for semantic-release compatibility ([0f3e44b](https://github.com/riedel28/tanstack-dashboard/commit/0f3e44bb00ee24cf534d0771ac59d0ae1e3613ff))
* **controllers:** prevent ILIKE injection and mass-assignment vulnerabilities ([0a098bd](https://github.com/riedel28/tanstack-dashboard/commit/0a098bd30ba3b3f8411163830cd28bc58a815ec6))
* **dropdown-menu:** update shortcut styles for destructive variant ([a052ed6](https://github.com/riedel28/tanstack-dashboard/commit/a052ed6ffa42a57d9cb43df788d17f80356a72d7))
* **forms:** handle optional values in reservation and profile components ([61d3ce7](https://github.com/riedel28/tanstack-dashboard/commit/61d3ce759fb93f13f8d2bd5c79255d839ca11cd5))
* **header:** update mobile menu button styles to show only on mobile ([728d0c9](https://github.com/riedel28/tanstack-dashboard/commit/728d0c992839d707f077f0d51aebe98787fa6cd9))
* **login:** set default values for email and password in login form ([b6600ff](https://github.com/riedel28/tanstack-dashboard/commit/b6600ff6ca597da24641b088def81c7c3138a607))
* **reservations:** synchronize room_name with room updates and enhance schema types ([90f271f](https://github.com/riedel28/tanstack-dashboard/commit/90f271fe6dbe866bf58fd52c2b07f65bcdc55012))
* **reservations:** update reservation creation logic and schema ([0b1ddff](https://github.com/riedel28/tanstack-dashboard/commit/0b1ddff1d24c313f4e8d8638ba0c602f24c7526d))
* **reservations:** update reservation tests and schemas for room_name consistency ([307e33f](https://github.com/riedel28/tanstack-dashboard/commit/307e33f7e0cdc436aa8515f86275a739484d4330))
* resolve remaining type issues in data-grid components ([264b4d8](https://github.com/riedel28/tanstack-dashboard/commit/264b4d8c8f0d47559fefadcc6f57800fb11e2d0c))
* resolve type issues and remove asChild from PopoverTrigger ([a9fcf2d](https://github.com/riedel28/tanstack-dashboard/commit/a9fcf2dff9dd3cb1a45a0ac723b4cbcf521f1e06))
* **rooms:** refine room status filtering and clean up imports ([cbf5299](https://github.com/riedel28/tanstack-dashboard/commit/cbf5299c647f18862ed87c3d8233255c1beeefda))
* **ui:** conditionally render PasswordStrengthMeter based on field state ([5b484c1](https://github.com/riedel28/tanstack-dashboard/commit/5b484c1276e7efa08171f35f6e7f3b602c154e75))
* **ui:** update badge variants in users table for improved status representation ([d81a3bd](https://github.com/riedel28/tanstack-dashboard/commit/d81a3bda73a8dcd0b7cad8992a0f8b7ba2beec4d))


### Features

* **auth-layout:** add language switcher and enhance layout responsiveness ([346e531](https://github.com/riedel28/tanstack-dashboard/commit/346e531cf067f90f434fcd4709ed510989983230))
* **auth:** add is_admin field to user model and enhance view switching logic ([8d7d695](https://github.com/riedel28/tanstack-dashboard/commit/8d7d695c027389f999c02e1944f42f0718562745))
* **auth:** enhance login functionality with rememberMe option and update token generation ([40f91d9](https://github.com/riedel28/tanstack-dashboard/commit/40f91d9579f4cc924ede69220b1cf3c65e1382d1))
* **auth:** implement auto logout on unauthorized access ([b2b5476](https://github.com/riedel28/tanstack-dashboard/commit/b2b5476b815bd46302034dcf2de2ba1ec26e2d96))
* **auth:** implement sign-up functionality and enhance login page ([4eae91d](https://github.com/riedel28/tanstack-dashboard/commit/4eae91d09b0da29f24de7f4ac320785a9ae5eaf5))
* **configuration:** update project settings and enhance component functionality ([9ab5512](https://github.com/riedel28/tanstack-dashboard/commit/9ab551285df5378e90319bd0385cd654ad0ec02f))
* **docs:** add code review guidelines to code-review.md ([8817807](https://github.com/riedel28/tanstack-dashboard/commit/881780741fcca3597b5819533caba18b5a4f4e76))
* **error-handling:** implement global error boundary for enhanced user feedback ([f723661](https://github.com/riedel28/tanstack-dashboard/commit/f7236619cdeb52b001b63c95e21ff37fbbf95418))
* **header, mobile-menu:** implement mobile menu in header component ([5b1606e](https://github.com/riedel28/tanstack-dashboard/commit/5b1606ed613b6dd35fad5d2d1dab4432a619341b))
* **header:** add property reload functionality to header component ([6dbab26](https://github.com/riedel28/tanstack-dashboard/commit/6dbab26b8d050cf8ff15aaf7696eee176a74a82a))
* **locales:** update German and English translations with new phrases and corrections ([8879ca3](https://github.com/riedel28/tanstack-dashboard/commit/8879ca3a05a090627c1b345f2714b6764568775e))
* **monitoring:** enhance monitoring logs functionality and UI ([647c098](https://github.com/riedel28/tanstack-dashboard/commit/647c0988516d46bec1dbebc6ee60c61768af5e2c))
* **monitoring:** implement monitoring logs API and database schema ([e4a900c](https://github.com/riedel28/tanstack-dashboard/commit/e4a900c94fa241307cca5402150e8575394bf768))
* **neon-postgres:** add comprehensive documentation for Neon Postgres integration ([8f1274d](https://github.com/riedel28/tanstack-dashboard/commit/8f1274d5b13d72b052612496913f2d42f71ef892))
* **properties:** implement properties management with CRUD functionality ([35af350](https://github.com/riedel28/tanstack-dashboard/commit/35af350b71abe3cd09a32081d17c8d5022bfe9ad))
* **properties:** implement properties query options for improved data fetching ([5e09d45](https://github.com/riedel28/tanstack-dashboard/commit/5e09d45606ca9ae48e89ea152b2cb31f3b813c1a))
* **properties:** update property seeding and API integration ([3b35948](https://github.com/riedel28/tanstack-dashboard/commit/3b3594809c6b8e2f70a9463627343c235bc1d201))
* **reservations:** add sorting functionality to reservations retrieval ([69f63df](https://github.com/riedel28/tanstack-dashboard/commit/69f63df9122d3980eed6dd8e95b5a5e5857ac5d5))
* **reservations:** add toast notification for "Push to device" action ([88e4ab0](https://github.com/riedel28/tanstack-dashboard/commit/88e4ab083cabc3f37cd6665249606851b28071e7))
* **reservations:** integrate query client and enhance reservation fetching ([8fc2ade](https://github.com/riedel28/tanstack-dashboard/commit/8fc2adeae1a322fffc89ddc3fbcbb6993e7170a4))
* **roles:** implement roles management API and database schema ([13733aa](https://github.com/riedel28/tanstack-dashboard/commit/13733aa752ebd2c5f9cfe457198e701742bceab8))
* **rooms:** add sorting functionality to room queries ([0ff0a5f](https://github.com/riedel28/tanstack-dashboard/commit/0ff0a5f410f7f1cf6ce2a72cb9979f16bc0efdac))
* **rooms:** enhance rooms management with new routes and components ([4fe7dd0](https://github.com/riedel28/tanstack-dashboard/commit/4fe7dd0f99aa194f247fd6a66833150264a37068))
* **rooms:** implement rooms management API and routing ([4f213a2](https://github.com/riedel28/tanstack-dashboard/commit/4f213a2768d90ed0f1eaac6987abb20aba64fae0))
* **selected-property:** implement user-selected property persistence feature ([faa52ea](https://github.com/riedel28/tanstack-dashboard/commit/faa52ea086989ed3461681dd37ee5a1454da8878))
* **sidebar:** add SidebarViewToggle component for view switching ([5ed3a8c](https://github.com/riedel28/tanstack-dashboard/commit/5ed3a8c53e83f8ed71c92f20f9faab788e1f3cb1))
* **tests:** add testing framework and setup for unit tests ([c8c2319](https://github.com/riedel28/tanstack-dashboard/commit/c8c231995a154e0f7265d7031ab13347198e34f2))
* **ui:** introduce Field and Item components for enhanced form and list structures ([33bd998](https://github.com/riedel28/tanstack-dashboard/commit/33bd998f876a914511d333240d8d18d0a08de29c))
* **ui:** refactor components to use base-ui library ([d0a2866](https://github.com/riedel28/tanstack-dashboard/commit/d0a2866a4b5c5e3b035c7109e552cb6c675292a8))
* **users:** implement user management API and database schema ([d9a2805](https://github.com/riedel28/tanstack-dashboard/commit/d9a28055c4d146331228f38fdc19c417c28289e2))

# [1.5.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.4.0...v1.5.0) (2025-09-12)


### Features

* **auth:** add authentication middleware for token verification ([17d6ef5](https://github.com/riedel28/tanstack-dashboard/commit/17d6ef58bd917f973909b928c5be10eefcfad3f9))
* **auth:** implement login on frontend ([27640f7](https://github.com/riedel28/tanstack-dashboard/commit/27640f79f6c4a8087805c40c6cbd9d06e6a4aacb))
* **auth:** implement user authentication with registration and login endpoints ([6eaa763](https://github.com/riedel28/tanstack-dashboard/commit/6eaa763ac66ab0206e022e8c8d3745bf15516274))
* **dependencies:** update package.json and package-lock.json for testing enhancements ([db62a44](https://github.com/riedel28/tanstack-dashboard/commit/db62a440ce60b6844371d66a92c39eb6751cbbf1))
* **logging:** integrate morgan for HTTP request logging and add global error handling middleware ([8ee2ffd](https://github.com/riedel28/tanstack-dashboard/commit/8ee2ffdcba4ca369f86229ce4e94bb4a4dfcd39c))
* **tests:** add Vitest configuration and setup for testing ([91c20ee](https://github.com/riedel28/tanstack-dashboard/commit/91c20ee9db25df83057aa9e3c641598aed6c119f))

# [1.4.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.3.0...v1.4.0) (2025-09-04)

### Features

* **database:** integrate @epic-web/remember for connection pooling and update environment schema ([9a05615](https://github.com/riedel28/tanstack-dashboard/commit/9a056158abf9bf5a7316be20f930d8e2f47391fa))
* **reservations:** enhance reservation filtering with date range support ([8743ebd](https://github.com/riedel28/tanstack-dashboard/commit/8743ebd69c11e68effb7fc0b4be925b046e388c7))
* **reservations:** implement guests management and update schema ([91972d2](https://github.com/riedel28/tanstack-dashboard/commit/91972d20add051edcb41493e46a4c1b1d503b055))

# [1.3.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.2.0...v1.3.0) (2025-09-01)

### Bug Fixes

- **pagination:** update default page sizes for data grid pagination component ([018981d](https://github.com/riedel28/tanstack-dashboard/commit/018981d6ec08d0f2aeec75386c4c5b71c88b2d8d))
- **reservations:** handle default values for pagination parameters ([5e45129](https://github.com/riedel28/tanstack-dashboard/commit/5e451297406d7bf73e536438933536630daceeb7))

### Features

- **reservations:** implement reservation management with CRUD operations ([96ad40f](https://github.com/riedel28/tanstack-dashboard/commit/96ad40fd2cebfbbd12fc43c64dc8c9191623c9b0))

# [1.2.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.1.0...v1.2.0) (2025-08-23)

### Bug Fixes

- **currency-formatter:** add locale support and improve formatting logic ([3392436](https://github.com/riedel28/tanstack-dashboard/commit/339243693868f811ec2b575492fc52835fa56078))
- **db:** ensure numeric types are parsed correctly from PostgreSQL ([41f64c7](https://github.com/riedel28/tanstack-dashboard/commit/41f64c7a7e9cba104b5d4b837b5a5ec1d9c88e34))
- **dependencies:** update prettier version to remove caret in package.json and package-lock.json ([051845e](https://github.com/riedel28/tanstack-dashboard/commit/051845ee43871bf2d97d9fcbbe0d687f9b016192))

### Features

- **reservations:** enhance reservation management with new fields and scripts ([6a87dc0](https://github.com/riedel28/tanstack-dashboard/commit/6a87dc0172120d4e7102c01750fc076523a6b090))

# [1.1.0](https://github.com/riedel28/tanstack-dashboard/compare/v1.0.0...v1.1.0) (2025-08-12)

## Features

- **api:** implement centralized Axios client and refactor API calls ([819e057](https://github.com/riedel28/tanstack-dashboard/commit/819e057f5ec52818e22d712fcd7a157ea0232ded))
- **reservations:** add endpoint to fetch reservation details by ID ([75ce199](https://github.com/riedel28/tanstack-dashboard/commit/75ce199012fc30ff9ecc33bda84f74d527f19514))
- **reservations:** implement create, update, and delete reservation endpoints ([6b6c8ec](https://github.com/riedel28/tanstack-dashboard/commit/6b6c8ec9be67541eaaae7afdd4a7118a75da03fe))

## 1.0.0 (2025-08-11)

## Bug Fixes

- **button:** update destructive button variant styling ([1d43e48](https://github.com/riedel28/tanstack-dashboard/commit/1d43e4835a5df25920b6fba6c2d65ca0d069dfbc))
- **pagination:** refactor DataGridPagination to use a centralized update function ([2f1e869](https://github.com/riedel28/tanstack-dashboard/commit/2f1e869f850ab095cd38b6289918cae7317de4d6))
- **password-input:** update Input type handling for password visibility toggle ([3f5b330](https://github.com/riedel28/tanstack-dashboard/commit/3f5b3308ecc72fa885ff3b1ee619f03d9a711d2d))
- **property-selector:** adjust loading skeleton width ([3ca574a](https://github.com/riedel28/tanstack-dashboard/commit/3ca574af2e3bb6b96982b97acc2b10fba0ee2bb2))
- **reservations:** adjust default items per page in filter schema ([87bd9b8](https://github.com/riedel28/tanstack-dashboard/commit/87bd9b8b92c5a774677d856a60287bb26ddd3eed))
- **reservations:** update filter logic ([1f87f70](https://github.com/riedel28/tanstack-dashboard/commit/1f87f705c93584efe5caec150216760b4b889e7e))
- **select:** replace ChevronDownIcon with ChevronsUpDownIcon for improved icon representation ([2fdae48](https://github.com/riedel28/tanstack-dashboard/commit/2fdae48eee168a3e8034d9890fe0825750553a20))
- **server:** update json-server port from 5000 to 3001 for consistency ([edccdf6](https://github.com/riedel28/tanstack-dashboard/commit/edccdf6645cc53755185069d48a311127ed524d2))
- **vite:** restore TanStack Router plugin with correct package name ([ba6580d](https://github.com/riedel28/tanstack-dashboard/commit/ba6580d2a1256d40967598389b81f57a5dea9730))

## Features

- add reservations page ([689376a](https://github.com/riedel28/tanstack-dashboard/commit/689376aea66e209d3a89b82e0e389b87500e1a6f))
- add reservations table ([22b360f](https://github.com/riedel28/tanstack-dashboard/commit/22b360f0a419abfdfe2a478688a13d333a9d838b))
- **api:** centralize API configuration and update fetch methods ([d656daa](https://github.com/riedel28/tanstack-dashboard/commit/d656daae17f48ca86582051dfe8100e6126a8d3a))
- **auth:** enhance user model and update dashboard layout with quick actions ([a7f9c2b](https://github.com/riedel28/tanstack-dashboard/commit/a7f9c2b2011b9fc1af5e22b26ab0af9392616e14))
- **auth:** implement authentication ([9996985](https://github.com/riedel28/tanstack-dashboard/commit/99969856c3cadf9c0f666867363116e864c4c8c2))
- **auth:** implement new authentication layout and enhance routing ([118e869](https://github.com/riedel28/tanstack-dashboard/commit/118e869ec5ecb4c01b65a20318f48535c9ade1d4))
- **auto-view-switching:** implement automatic view switching based on URL routes ([d2970bc](https://github.com/riedel28/tanstack-dashboard/commit/d2970bcbd7aa683c5774a6ea46033b29bd5ce4a3))
- **backend:** set up initial backend structure with Express and PostgreSQL ([532add2](https://github.com/riedel28/tanstack-dashboard/commit/532add2d71de26f66a0c66afbef51def6290c275))
- **breadcrumbs:** integrate breadcrumb navigation across dashboard routes and enhance internationalization ([544f141](https://github.com/riedel28/tanstack-dashboard/commit/544f141cf02901003c4be41f7240b0684c47935e))
- **button:** enhance button component with loading state and icon support ([cb0fb0b](https://github.com/riedel28/tanstack-dashboard/commit/cb0fb0b970a685bf31342f3e32115971f08d9cca))
- **ci:** add comprehensive CI workflow for PRs and releases ([31a70b0](https://github.com/riedel28/tanstack-dashboard/commit/31a70b0324665dfac2ec7ffc074b4b6b18530074))
- **code-component:** add Code component with copy functionality ([6545d67](https://github.com/riedel28/tanstack-dashboard/commit/6545d6746b7954b697a9e3877062565ae83f281d))
- **dashboard:** add logo, sidebar header title and move sidebar trigger to the sidebar ([10b3887](https://github.com/riedel28/tanstack-dashboard/commit/10b38874ed5454416106a28e400f3cd2a2c151b7))
- **dashboard:** enhance layout and styling for improved user experience ([f01dfb6](https://github.com/riedel28/tanstack-dashboard/commit/f01dfb60d763521feb6db7ca8f8221345fe54ad1))
- **dashboard:** refactor dashboard layout and enhance routing ([47fab9c](https://github.com/riedel28/tanstack-dashboard/commit/47fab9c8f2c9339399ed961e9b98223f58fd5e86))
- **dashboard:** refactor layout and enhance user experience with new components ([ec913da](https://github.com/riedel28/tanstack-dashboard/commit/ec913dac37264eb781a43e13fbf879107a163402))
- **dashboard:** restructure routing and implement dashboard layout ([b131722](https://github.com/riedel28/tanstack-dashboard/commit/b13172268a59731ba6b212ec85ea5189d3b0998a))
- **data-grid:** implement drag-and-drop functionality and enhance pagination ([8bd9871](https://github.com/riedel28/tanstack-dashboard/commit/8bd9871ff9078c880194cd803e127ac13def7e20))
- **dependencies:** add json-server and update related packages ([74d969c](https://github.com/riedel28/tanstack-dashboard/commit/74d969c2c4c60b66a40a1e12f086c53306bb0058))
- **dependencies:** migrate to Zod v4 ([5de08e0](https://github.com/riedel28/tanstack-dashboard/commit/5de08e04e2776f50a49b6aa0ea35b4bb8074bf04))
- **dependencies:** setup automatic versioning ([fc693c6](https://github.com/riedel28/tanstack-dashboard/commit/fc693c687bebdb93a3e9b8113ee06c6549328338))
- **error-display:** introduce reusable ErrorDisplay component for error handling ([10cbfd1](https://github.com/riedel28/tanstack-dashboard/commit/10cbfd1fbac65b28430fae77d537df801302ddee))
- **forgot-password:** implement password reset functionality with internationalization ([b2fa02e](https://github.com/riedel28/tanstack-dashboard/commit/b2fa02e76d59f2087b9025e8e020cb1fb08dff90))
- **form-validation:** implement form validation with internationalized messages ([9f5d8a3](https://github.com/riedel28/tanstack-dashboard/commit/9f5d8a3e42e77c06868e04f2d9b0cfbf1ffda0a3))
- **guests:** add edit guest modal and enhance internationalization ([be428bd](https://github.com/riedel28/tanstack-dashboard/commit/be428bd5074f2e30d3283a4a5b7672c99c6ea5a2))
- **hooks:** add custom hooks for clipboard and mobile detection ([6c167d2](https://github.com/riedel28/tanstack-dashboard/commit/6c167d2d2f6c42be60b740b4e93e2ce1e3a1fe39))
- **i18n:** integrate internationalization support with react-intl ([3bc08cc](https://github.com/riedel28/tanstack-dashboard/commit/3bc08cc0c6381f1b48b2f4c44806a9f04e98e271))
- **i18n:** integrate Lingui for internationalization support ([e877b2a](https://github.com/riedel28/tanstack-dashboard/commit/e877b2a4fd241554f1727a4ac56c4079286a450b))
- **i18n:** transition to Lingui for internationalization and update components ([0502a87](https://github.com/riedel28/tanstack-dashboard/commit/0502a875d765cc84e3d08db789f8b8f9b3264d26))
- **i18n:** update German and English translations and enhance property selector ([fe7d045](https://github.com/riedel28/tanstack-dashboard/commit/fe7d0453c05b59357cc7f235ab94d40140419470))
- init commit ([49f030b](https://github.com/riedel28/tanstack-dashboard/commit/49f030bd4f231312dee3f8054f94071f51515f97))
- **layout:** add new layout with sidebar ([b313c4b](https://github.com/riedel28/tanstack-dashboard/commit/b313c4b71cd45984bb42bb242c8da611c4f7d5f0))
- **layout:** create dashboard layout ([36ea446](https://github.com/riedel28/tanstack-dashboard/commit/36ea44638224e67d02af55cac6fc5f9ed444eadc))
- **logout:** implement logout confirmation dialog and enhance internationalization ([621f373](https://github.com/riedel28/tanstack-dashboard/commit/621f3739711051eec26bf5ac2e23ab2e35d9d742))
- **not-found:** add reusable NotFound component with internationalization support ([6e0c376](https://github.com/riedel28/tanstack-dashboard/commit/6e0c3764391874a6f5be3b7e7cc35efde8f6e720))
- **password-strength:** add password strength meter component and integrate into password section ([9a326aa](https://github.com/riedel28/tanstack-dashboard/commit/9a326aa897ad5bbecd97021a35aec0be986aeb48))
- **products:** add delete product dialog and enhance product management interface ([9a08c94](https://github.com/riedel28/tanstack-dashboard/commit/9a08c9475c87ceb03dde0d81885e4e37b813cb20))
- **products:** add EditProductModal for product title editing ([bdf6dfe](https://github.com/riedel28/tanstack-dashboard/commit/bdf6dfe7202a236cb3caaab124f2e29832ea44ee))
- **products:** add headless-tree dependencies and update routing structure ([7f48fa1](https://github.com/riedel28/tanstack-dashboard/commit/7f48fa15a06821d2c5ec9587c0762df414cab9ed))
- **products:** add product categories and products to db.json and update API endpoints ([7a0e114](https://github.com/riedel28/tanstack-dashboard/commit/7a0e11439beab53ae7de4e18a56d870f3abbc4f4))
- **products:** enhance category management with modals ([b057b38](https://github.com/riedel28/tanstack-dashboard/commit/b057b389b3ca2cc7d0f70074dfaff2abc0cc2ebe))
- **products:** enhance product management with add product modal and improved UI ([9540af6](https://github.com/riedel28/tanstack-dashboard/commit/9540af6f32b3d260e7bab0e082efd67d6e3d914e))
- **products:** enhance product management with new items and delete functionality ([a446138](https://github.com/riedel28/tanstack-dashboard/commit/a4461382b63e002a481ec8aacd43b2450737c572))
- **products:** refactor product and category management in ProductTreeEditor ([6f00ad7](https://github.com/riedel28/tanstack-dashboard/commit/6f00ad7c20355d2571af922c3a34bac6e8d458b6))
- **products:** refactor product management interface and introduce ProductsList component ([90835f6](https://github.com/riedel28/tanstack-dashboard/commit/90835f633265319e91281dc8d3b93d955f69e84d))
- **profile:** add user roles management section to profile ([5260a9a](https://github.com/riedel28/tanstack-dashboard/commit/5260a9a079ba80ea8e57af43074e345833e4122f))
- **profile:** implement user profile management sections with avatar, password, and personal information updates ([99e25a0](https://github.com/riedel28/tanstack-dashboard/commit/99e25a0cbd250765b465b889b6dd626256d83ebc))
- remove PropertySelector and DashboardLayout components ([f422ce7](https://github.com/riedel28/tanstack-dashboard/commit/f422ce7c00ece8ec2539b86b31456daf99baf44b))
- **reservation-modal:** enhance reservation creation with loading state and form handling ([e0818d8](https://github.com/riedel28/tanstack-dashboard/commit/e0818d896700358b47c2dbea9db8a294505f6d0f))
- **reservations:** add functionality to create a reservation ([3ce04fe](https://github.com/riedel28/tanstack-dashboard/commit/3ce04fe0ea38bba07f40973181efc752156d418c))
- **reservations:** add refresh button to reservations page for improved user experience ([9590777](https://github.com/riedel28/tanstack-dashboard/commit/959077783cb19267b666e456f52d8175d69b153e))
- **reservations:** add reservation page ([dbeb01f](https://github.com/riedel28/tanstack-dashboard/commit/dbeb01fa1233d4e74d7cb20e722cfffbca7c0155))
- **reservations:** create reservations page ([6250b4e](https://github.com/riedel28/tanstack-dashboard/commit/6250b4eaaa2db542c5470e7c30f9e72da923764c))
- **reservations:** enhance deletion functionality ([9e70c09](https://github.com/riedel28/tanstack-dashboard/commit/9e70c091c526b2f73dbdc4e357ea520ef77d2a85))
- **reservations:** enhance error handling in reservations page ([5e4d699](https://github.com/riedel28/tanstack-dashboard/commit/5e4d699eaa0889aa9b05ed76b7dca38b66453269))
- **reservations:** enhance reservation details display and internationalization ([4cc9051](https://github.com/riedel28/tanstack-dashboard/commit/4cc905188646b57bc773a719e298315f205b9af4))
- **reservations:** enhance reservation editing with new components and internationalization ([c9f03f6](https://github.com/riedel28/tanstack-dashboard/commit/c9f03f65a52001b9f08c63f35ea600909cb401a3))
- **reservations:** enhance reservation filtering and search functionality ([d4672d9](https://github.com/riedel28/tanstack-dashboard/commit/d4672d9454cbd754c63e8153a2e22e1bf4531fd2))
- **reservations:** enhance reservation form and data structure ([89a510a](https://github.com/riedel28/tanstack-dashboard/commit/89a510abfe2f4ddabfa77aa508e6843f39b48b40))
- **reservations:** enhance share dialog with email, SMS, and WhatsApp functionality ([a88191b](https://github.com/riedel28/tanstack-dashboard/commit/a88191b56262bfcf9bcd04b38e0d32c33a817214))
- **reservations:** enhance status display in reservations table ([36c5a80](https://github.com/riedel28/tanstack-dashboard/commit/36c5a80ec9e8e13a0814b8ed9157da19d643e767))
- **reservations:** implement delete and share functionality in reservations table ([fd14f02](https://github.com/riedel28/tanstack-dashboard/commit/fd14f02dffefcc9f0d37737dcfe289ff3b64e640))
- **reservations:** implement delete functionality ([1a19835](https://github.com/riedel28/tanstack-dashboard/commit/1a19835ceb59b73b7bd3ac9b1a5441c1394bbe85))
- **reservations:** implement loading state with TableSkeleton component ([7cd3392](https://github.com/riedel28/tanstack-dashboard/commit/7cd33929c8f733b74f91e40634def09d1441902a))
- **reservations:** implement reservations API and refactor reservations page ([d44fc5e](https://github.com/riedel28/tanstack-dashboard/commit/d44fc5ed970910d2d3a817c8923ab39f4c085917))
- **reservations:** update reservation data structure and enhance status display ([202ea03](https://github.com/riedel28/tanstack-dashboard/commit/202ea03a9684e6f6e06da0f1a6926f3eaffeec89))
- **routes:** implement user/admin view switching and enhance route organization ([9a75aca](https://github.com/riedel28/tanstack-dashboard/commit/9a75acaca3470707e6d1d52758a2612f0b1f59de))
- **ui:** add PasswordInput component and integrate into login form ([1221547](https://github.com/riedel28/tanstack-dashboard/commit/122154705ddf0f531cfd04f9da0d8bf0dab1adc1))
- **ui:** enhance badge, button, card, scroll area, and select components with new variants and context support ([4bc0f18](https://github.com/riedel28/tanstack-dashboard/commit/4bc0f1839cd03948a0184b5a1b6d63bdbdc91787))
- **users:** implement UsersTable component with enhanced user data display and internationalization ([83fd4d8](https://github.com/riedel28/tanstack-dashboard/commit/83fd4d8320a9a06b47562c4709f97fc8e1a86477))
- **versioning:** implement dynamic app versioning and enhance internationalization ([693c0e5](https://github.com/riedel28/tanstack-dashboard/commit/693c0e5e2ea6746db1af4f06a427a6c3e213d6c1))
