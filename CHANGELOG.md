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
