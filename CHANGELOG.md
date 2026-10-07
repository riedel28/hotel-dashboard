# [1.17.0](https://github.com/riedel28/hotel-dashboard/compare/v1.16.0...v1.17.0) (2026-10-07)


### Bug Fixes

* **monitoring:** full-width underline and back path on the reservation link ([10fe5b4](https://github.com/riedel28/hotel-dashboard/commit/10fe5b40938aa1e80d33774f0d4e1efa1e7be4fd))
* **monitoring:** tolerate invalid search params in the URL ([71a9431](https://github.com/riedel28/hotel-dashboard/commit/71a943162b2b7852547fb8d9646408fc202a9e0e))
* **reservations:** accept only genuine in-app back paths ([2dca0cc](https://github.com/riedel28/hotel-dashboard/commit/2dca0cccdb6f832ec76c28bff4f5a12b0f85e368))
* **reservations:** enforce unique booking_nr ([d4c7e14](https://github.com/riedel28/hotel-dashboard/commit/d4c7e1436eeeeb5e308c0903ab913b8e792331bd))


### Features

* **monitoring:** extend the logs API with filters and status counts ([7c936d6](https://github.com/riedel28/hotel-dashboard/commit/7c936d6506bc609244835079edfea8b5bbcab47d))
* **monitoring:** show log counts in the status filter ([57b36de](https://github.com/riedel28/hotel-dashboard/commit/57b36dea8c035b343d4b65ae0329d1282324f113))
* **reservations:** optional back link on the reservation page ([a15131e](https://github.com/riedel28/hotel-dashboard/commit/a15131e4c83b929a9a7aea49753582081a6d6ad3))
* **ui:** add DataGridSegmentedFilter ([5ea124f](https://github.com/riedel28/hotel-dashboard/commit/5ea124f1bc0a3e70f8c91371ddec2b190d891e97))
* **ui:** tint the selected segment of DataGridSegmentedFilter like its badge ([eff570f](https://github.com/riedel28/hotel-dashboard/commit/eff570f22fcb8830102b727d22208830e8908bae))

# [1.16.0](https://github.com/riedel28/hotel-dashboard/compare/v1.15.0...v1.16.0) (2026-10-06)


### Bug Fixes

* **filters:** align checkbox filter label offset with radio filter ([8638fe5](https://github.com/riedel28/hotel-dashboard/commit/8638fe56b0ed67f8324fc468c49757264bb6771e))
* **ui:** unify invalid and focus styles across form controls ([e67910b](https://github.com/riedel28/hotel-dashboard/commit/e67910ba6b00df9dc12c75853ac76dfd5d7c2786))


### Features

* **properties:** add per-property nav items ([fbaa293](https://github.com/riedel28/hotel-dashboard/commit/fbaa29315820335abb96ca27c5382b76d0e30a72))

# [1.15.0](https://github.com/riedel28/hotel-dashboard/compare/v1.14.2...v1.15.0) (2026-10-05)


### Bug Fixes

* **badge:** define the missing badge-destructive tokens ([3962271](https://github.com/riedel28/hotel-dashboard/commit/3962271c0ec4e34de3d18ba94e8439d44c354cc6))
* **biome.json:** update schema version to 2.4.16 ([371e300](https://github.com/riedel28/hotel-dashboard/commit/371e300d79ccfe1ab0972f7654510c50b952958c))
* **combobox:** keep popup footer visible with long lists ([3bda7ab](https://github.com/riedel28/hotel-dashboard/commit/3bda7ab6b02a64b4992d26811a781aea5bf15e38))
* **entry-card:** update Item variant styles ([2a2ae10](https://github.com/riedel28/hotel-dashboard/commit/2a2ae10ed52ab44283c982572741a5637ce50e57))
* **forms:** restore full-strength invalid border in dark mode ([77c8ad0](https://github.com/riedel28/hotel-dashboard/commit/77c8ad0f940b98564a890af5ae68ee024426a154))
* **globals.css:** correct import quotes and adjust color values ([a173d64](https://github.com/riedel28/hotel-dashboard/commit/a173d641327ab8a59a4fab686ab444b41b02c54a))
* **guest-abc:** keep letter nav position stable regardless of add button ([46384da](https://github.com/riedel28/hotel-dashboard/commit/46384da1d3e1644f509c910e60490fd5a1117030))
* **guest-abc:** prevent edit-card height inflation from Item flex-wrap ([12f1c5a](https://github.com/riedel28/hotel-dashboard/commit/12f1c5a5efbfdf41330d19075a4317fe110b4df3))
* **guest-abc:** refetch property-scoped data on property switch ([1cd0823](https://github.com/riedel28/hotel-dashboard/commit/1cd0823ddc5f08646c5df410101d72ca838e7bec))
* **input:** thin error borders matching focus thickness ([0f218ac](https://github.com/riedel28/hotel-dashboard/commit/0f218acb9b6eb600f3dab60cab9e2af067470855))
* **layout:** keep section jumps from sliding the page under the header ([41cb07c](https://github.com/riedel28/hotel-dashboard/commit/41cb07c3bda1006c06522a2bca49f3905848c032))
* **lint:** clear the findings oxlint surfaced ([8bf9eb6](https://github.com/riedel28/hotel-dashboard/commit/8bf9eb62a6118389f3dc139f5cf5fb3316e47cd1))
* **logout-dialog:** update logout success handling and clear query client ([589a9ed](https://github.com/riedel28/hotel-dashboard/commit/589a9eded8284784a86e13d1ddcc825de4acacfc))
* **password-strength:** raise label contrast and stop the layout shift ([e3f898a](https://github.com/riedel28/hotel-dashboard/commit/e3f898a3dcf7ec92986ce726b37dbc22be9798f6))
* **payment-provider-form:** simplify logo image rendering ([4b46d95](https://github.com/riedel28/hotel-dashboard/commit/4b46d954c47aaa9bf3df5f7fe852cce8289c0b9f))
* **payment-provider:** bump mapping input height on mobile ([699dcbf](https://github.com/riedel28/hotel-dashboard/commit/699dcbff1187c30f0bf05ccba6b1d7e886ff1713))
* **payment-provider:** make form layout responsive ([197ff4b](https://github.com/riedel28/hotel-dashboard/commit/197ff4b18876339f9a3a98d36881e9dcef19fad7))
* **payment-provider:** remove dead code from API key section ([d191d38](https://github.com/riedel28/hotel-dashboard/commit/d191d385f7f5ecbeccc895afbcd80a73ff43b270))
* **products:** answer 400 when a category vanishes mid-create ([8095514](https://github.com/riedel28/hotel-dashboard/commit/8095514332034c99a2b7bb9a0643a037042ac307))
* **products:** atomic category delete and move, 400 for writes without a property ([e0eaa4c](https://github.com/riedel28/hotel-dashboard/commit/e0eaa4c2257330dba1b28db2b4aeed3b47ce0819))
* **products:** require a price to be entered for a new product ([e7125c6](https://github.com/riedel28/hotel-dashboard/commit/e7125c64951dcc1c8f9f4ce2da278445105533f9))
* **products:** update the product list as soon as a change is confirmed ([b29d23c](https://github.com/riedel28/hotel-dashboard/commit/b29d23c1576f54f5b356b140d941437ba0b0580d))
* **products:** use the destructive button variant in delete dialogs ([d24c079](https://github.com/riedel28/hotel-dashboard/commit/d24c079fcf3c4f3106c836f0c785b9125585ba10))
* **profile:** reset cropper per image and defer blob revoke ([4b40221](https://github.com/riedel28/hotel-dashboard/commit/4b402215054ff1d9b61ffdee1e93c9cec713f59e))
* remove unused imports flagged by typecheck ([8f8e292](https://github.com/riedel28/hotel-dashboard/commit/8f8e292fc5ce2e55cdb2d443f4c9328cbd20841b))
* **router:** route hash updates through the router and preload on intent ([72c8ace](https://github.com/riedel28/hotel-dashboard/commit/72c8ace46594cd0fee195a9eb47672e6237ac46b))
* **seed:** resolve data dir without Bun-only import.meta.dir ([713643e](https://github.com/riedel28/hotel-dashboard/commit/713643e37876276bea44e1b755e983b8f4bff48e))
* **status-cell:** change badge color from red to pink for error state ([7ec1666](https://github.com/riedel28/hotel-dashboard/commit/7ec1666375061fe37403e83579ff597676b050be))
* **theme:** base destructive tokens on the Tailwind rose ramp ([d70db4e](https://github.com/riedel28/hotel-dashboard/commit/d70db4e152170493f08f5355a975fac4f117e27d))
* **theme:** confine the country-picker tint and settle --danger ([e797075](https://github.com/riedel28/hotel-dashboard/commit/e797075775bf8daf5351741bb8bab8fe9feb50c9))
* **ui:** dark disabled bg on textarea ([e8b3e1e](https://github.com/riedel28/hotel-dashboard/commit/e8b3e1eacbb902766de45ea23217ed50f6da8dd5))
* **ui:** tweak input error styles and guest-abc card details ([435d66a](https://github.com/riedel28/hotel-dashboard/commit/435d66a15e92382e1a8f214a3352a64245382715))
* update translation keys and references in messages.po for consistency and accuracy ([2f481b0](https://github.com/riedel28/hotel-dashboard/commit/2f481b09f025e33b43873b568cc1add3c85fd06e))


### Features

* **avatar:** add xl size variant ([0b7fea2](https://github.com/riedel28/hotel-dashboard/commit/0b7fea299b19888a07a14522005abc68f9817223))
* **dashboard-layout:** add Door Locks navigation entry ([11c83fa](https://github.com/riedel28/hotel-dashboard/commit/11c83fa9aba8991c4e9087c5a163ddd86184090a))
* **dashboard-layout:** add Payment Provider nav and fix sticky action bar ([3a6deb3](https://github.com/riedel28/hotel-dashboard/commit/3a6deb3c158682a5d16b9d7110ebc1d7a2b86485))
* **data-grid-radio-filter:** add new radio filter component with dropdown functionality ([0f7a85a](https://github.com/riedel28/hotel-dashboard/commit/0f7a85a5dc8ae4aa404108b4fc98ae9bfacfe40a))
* **data-grid:** clearable radio filter with optional footer ([b45ceee](https://github.com/riedel28/hotel-dashboard/commit/b45ceee25163cc079e9e77d88b672c9c2ec376bc))
* **db:** add avatar, TOTP and token_version columns ([f19ca28](https://github.com/riedel28/hotel-dashboard/commit/f19ca284cd8a4b9e20d8b1a787b060c541729124))
* **door-locks:** add integration guide link and rose status color ([6542f70](https://github.com/riedel28/hotel-dashboard/commit/6542f707f91853504d503047737cbed9412d43c0))
* **door-locks:** add SALTO integration page with connection test dialog ([09cbf6d](https://github.com/riedel28/hotel-dashboard/commit/09cbf6d0fb7f3cd9d1def8a2c7ae5cd4e8e6644e))
* **filters:** show status badges in reservation and room status filters ([0ce9d20](https://github.com/riedel28/hotel-dashboard/commit/0ce9d2010bdaab09febcc652ab35ce6a32133240))
* **guest-abc:** add CRUD endpoints scoped to selected property ([5091477](https://github.com/riedel28/hotel-dashboard/commit/5091477aceaaddfe0b5ff8fb73fb4ad8312c7ef8))
* **guest-abc:** add description under page title ([146ddc1](https://github.com/riedel28/hotel-dashboard/commit/146ddc1bf3b5bb800b0e21b8d9af4f2f01bf2a72))
* **guest-abc:** add entries table and shared validation types ([dea9363](https://github.com/riedel28/hotel-dashboard/commit/dea93638896103524bb8bcb6286a3baab4e6ecb5))
* **guest-abc:** add frontend API client ([b53206d](https://github.com/riedel28/hotel-dashboard/commit/b53206de91ceccc1e637f80ce739436f60cfa98c))
* **guest-abc:** interactive Guest ABC content manager page ([048904d](https://github.com/riedel28/hotel-dashboard/commit/048904d07334a6e8a3e90cebc35f0bd2ed846813))
* **guest-abc:** seed demo entries onto The Overlook Hotel ([f116d1e](https://github.com/riedel28/hotel-dashboard/commit/f116d1e8bdbea3dc6316c0bf587689884da9ecc5))
* **guest-abc:** subtle motion on letter nav and entry cards ([5c9351f](https://github.com/riedel28/hotel-dashboard/commit/5c9351f67db406650952d2af7e713e6ef0123a0d))
* **guest-abc:** wire page and components to the CRUD API ([8fbf303](https://github.com/riedel28/hotel-dashboard/commit/8fbf303ad41e9abeaecdc9034a909ee777c21c2d))
* **monitoring:** add status and type filters ([1e561c0](https://github.com/riedel28/hotel-dashboard/commit/1e561c0810f80ec79a96966450b4bb441d4967ef))
* **otp:** add slot placeholders and rebuild the invalid state ([e1bc8e3](https://github.com/riedel28/hotel-dashboard/commit/e1bc8e3fb21a28dc8be6254c7dd17310e8236577))
* **payment-provider:** add Adyen configuration page ([b4658ca](https://github.com/riedel28/hotel-dashboard/commit/b4658ca367817f82a87e42a2cc341a9f432951b4))
* **payment-provider:** sticky table of contents and API key field refactor ([f602dc8](https://github.com/riedel28/hotel-dashboard/commit/f602dc8ccdd445d2e0e4db5d58a2ba69ae031af8))
* **pms-provider:** add integration guide link and layout tweaks ([07c63e8](https://github.com/riedel28/hotel-dashboard/commit/07c63e897c26bc91ef3d029e2e94d4ba6223cd8f))
* **pms:** add provider configuration page ([191277e](https://github.com/riedel28/hotel-dashboard/commit/191277e0ed4c6aa51bfa0652511cd5e4d789000a))
* **products:** add a top-level category from the card header ([fdef96d](https://github.com/riedel28/hotel-dashboard/commit/fdef96d0046c8730ed031240f7e1a4960f1d6eb7))
* **products:** add product categories and products API ([c742d63](https://github.com/riedel28/hotel-dashboard/commit/c742d637490f0f7e08c26a9de0320e82344f6c27)), closes [#30](https://github.com/riedel28/hotel-dashboard/issues/30)
* **products:** edit products in a drawer with a rich-text description ([9ba1127](https://github.com/riedel28/hotel-dashboard/commit/9ba112716cb997a42132cba00c8e6cb4cb218e43)), closes [#30](https://github.com/riedel28/hotel-dashboard/issues/30)
* **products:** move a category to another category ([c8539f1](https://github.com/riedel28/hotel-dashboard/commit/c8539f17d0a903c81ab45e31ebfeabe561a0a9d4))
* **products:** one screen at a time on narrow viewports ([08b022f](https://github.com/riedel28/hotel-dashboard/commit/08b022f4b1583d32fae9ad08b455b0cbe0dc8552))
* **products:** optimistic category rename with a save button ([7d4d7b8](https://github.com/riedel28/hotel-dashboard/commit/7d4d7b8385eb774998ad301a8151f58f3fa0bdc2))
* **products:** polish the category tree ([f6d115f](https://github.com/riedel28/hotel-dashboard/commit/f6d115fbb7c4ea5d7caf4efa01f9d8ed7fa98b07))
* **products:** prefetch products on hover and smooth out loading ([949d4fd](https://github.com/riedel28/hotel-dashboard/commit/949d4fd0b721330cb9a7180af2407b58077470ad))
* **products:** price, quantity and description on products ([d543afe](https://github.com/riedel28/hotel-dashboard/commit/d543afeb5934b3c79743afd6fab13cfc7afd99d6))
* **products:** rename a category inline instead of in a modal ([35dfde7](https://github.com/riedel28/hotel-dashboard/commit/35dfde7ed44ffae3ea6ca71a26692ab151bf3736))
* **products:** sanitize rich-text descriptions on the server ([0d5f426](https://github.com/riedel28/hotel-dashboard/commit/0d5f4260885cbcaa0af430b7495f4a5e882a442f)), closes [#30](https://github.com/riedel28/hotel-dashboard/issues/30)
* **products:** search categories and make the tree keyboard-accessible ([e66b9f2](https://github.com/riedel28/hotel-dashboard/commit/e66b9f247291f12fab42c989a48cce91016300e6))
* **products:** show products in a compact table ([6085744](https://github.com/riedel28/hotel-dashboard/commit/60857443e0a4214ad9bfcc5b9a27690052d17408))
* **products:** table headers, actions menu, breadcrumbs and search ([5fb480b](https://github.com/riedel28/hotel-dashboard/commit/5fb480bca1ff5522f6fd4195953409ed39584931))
* **profile:** add self-service profile, password and TOTP endpoints ([9a5daa1](https://github.com/riedel28/hotel-dashboard/commit/9a5daa155082d659433c75d2022237973543e524))
* **profile:** move email verification into the field addon ([5a52047](https://github.com/riedel28/hotel-dashboard/commit/5a5204747a41ef956693a255a3859e216f937e6c))
* **profile:** rebuild profile page with avatar, 2FA and password flows ([9d3bb13](https://github.com/riedel28/hotel-dashboard/commit/9d3bb131518fe0d4395fdd1967d20a5a31bfc38b))
* **properties:** filter by multiple stages ([a0ec5ff](https://github.com/riedel28/hotel-dashboard/commit/a0ec5ff29d90803b1e472c717e17d7b902361ae6))
* **reservations:** enhance status filtering and validation for reservations ([44f2865](https://github.com/riedel28/hotel-dashboard/commit/44f2865cdf2661076e69f0b23fd98e4c05364739))
* **routes:** add door-locks route to DashboardLayout ([27840a4](https://github.com/riedel28/hotel-dashboard/commit/27840a46bf21340639aa4e89fba7ddc6a7c9c639))
* **sidebar:** show Products in the Content Manager section ([6c38130](https://github.com/riedel28/hotel-dashboard/commit/6c38130dd8fe06b6722f7e417b4446fc3e2f259c))
* **theme:** add --danger for destructive text on neutral surfaces ([543165e](https://github.com/riedel28/hotel-dashboard/commit/543165e0acd9f00d1c22770591d145470df7ba42))
* **ui:** add a shared rich-text editor ([3c13ffa](https://github.com/riedel28/hotel-dashboard/commit/3c13ffa69317f5f703c6ea1b489f340e12b05925))
* **ui:** add QueryBoundary ([9b3e339](https://github.com/riedel28/hotel-dashboard/commit/9b3e33927deba582654e65e0e093cc2883a87d2c))
* **ui:** add rose badge variant and bolder card title ([9dffe4c](https://github.com/riedel28/hotel-dashboard/commit/9dffe4c28aee92b7627e3008e62ddedf8d815a26))
* **ui:** add StatusDisc ([7084f28](https://github.com/riedel28/hotel-dashboard/commit/7084f28c371f49cd67612226dea09f57c2cf3778))
* **ui:** borderless Table variant, Textarea focus parity, --font-mono token ([4fa10bb](https://github.com/riedel28/hotel-dashboard/commit/4fa10bbf4e083bbf375e9b9bbc136a1ce606fc4f))
* **ui:** give Empty tone variants ([26004bf](https://github.com/riedel28/hotel-dashboard/commit/26004bf0cfb628d82addae648ba1a20fb3bfe935))
* **ui:** replace the native search clear button with a plain icon button ([28b8402](https://github.com/riedel28/hotel-dashboard/commit/28b84023c4a4063d51e250a70906161ab6d548e9))
* **ui:** restyle radio controls ([250f6d2](https://github.com/riedel28/hotel-dashboard/commit/250f6d2ad87efa242af0db6a0c4c38f1be99adcb))
* **ui:** unify destructive token and form-control invalid styles ([262c18e](https://github.com/riedel28/hotel-dashboard/commit/262c18ead5bec53cae1b966a690e8d534b34ef4f))


### Performance Improvements

* **guest-abc:** cache entries and prefetch via route loader ([12ed125](https://github.com/riedel28/hotel-dashboard/commit/12ed1254b96a4da1825da5ed0ce9805d4e229ad4))

## [1.14.2](https://github.com/riedel28/hotel-dashboard/compare/v1.14.1...v1.14.2) (2026-02-28)


### Bug Fixes

* **deploy:** migrate API proxy from Fly.io to Render ([8efc286](https://github.com/riedel28/hotel-dashboard/commit/8efc286d6d1c483cde39e6f6e4b1ea9cf512084b))

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

* **ci:** skip redundant typecheck in build step ([f524ab5](https://github.com/riedel28/hotel-dashboard/commit/f524ab545f33994c65c427297735a27a38c30327))

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
