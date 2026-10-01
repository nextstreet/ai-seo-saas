const baseUrl = (process.env.DIRECTUS_URL || 'http://localhost:8055').replace(/\/$/, '');
const email = process.env.DIRECTUS_ADMIN_EMAIL || 'admin@example.com';
const password = process.env.DIRECTUS_ADMIN_PASSWORD || 'change-me-now';

async function request(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}), ...(token ? { Authorization: `Bearer ${token}` } : {}) },
  });
  if (!response.ok) throw new Error(`${options.method || 'GET'} ${path}: ${response.status} ${await response.text()}`);
  if (response.status === 204) return null;
  return response.json();
}

let token = process.env.DIRECTUS_TOKEN || '';
if (!token) {
  const login = await request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) });
  token = login.data.access_token;
}

const labels = (en, zh) => [{ language: 'en-US', translation: en }, { language: 'zh-CN', translation: zh }];
const field = (field, type, en, zh, extra = {}) => ({
  field,
  type,
  meta: { interface: type === 'json' ? 'input-code' : type === 'text' ? 'input-multiline' : 'input', translations: labels(en, zh), ...extra.meta },
  schema: { ...extra.schema },
});
const statusField = () => field('status', 'string', 'Status', '状态', {
  schema: { default_value: 'draft' },
  meta: { interface: 'select-dropdown', options: { choices: [
    { text: 'Draft', value: 'draft' }, { text: 'Review', value: 'review' },
    { text: 'Published', value: 'published' }, { text: 'Archived', value: 'archived' },
  ] } },
});
const tenantField = () => field('tenant_id', 'uuid', 'Tenant', '租户', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'], required: true } });
const localeField = () => field('languages_code', 'string', 'Language', '语言', { schema: { default_value: 'en-US' }, meta: { interface: 'select-dropdown', options: { choices: [{ text: 'English', value: 'en-US' }, { text: '简体中文', value: 'zh-CN' }] } } });

const collections = [
  { name: 'cms_tenants', en: 'Sites', zh: '站点', fields: [field('slug', 'string', 'Site slug', '站点标识'), field('name', 'string', 'Name', '名称'), field('primary_locale', 'string', 'Primary locale', '主要语言', { schema: { default_value: 'en-US' } }), field('available_locales', 'json', 'Available locales', '可用语言'), statusField()] },
  { name: 'cms_categories', en: 'Categories', zh: '产品分类', fields: [tenantField(), statusField(), field('parent_id', 'uuid', 'Parent category', '上级分类', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('sort', 'integer', 'Sort', '排序', { schema: { default_value: 10 } })] },
  { name: 'cms_category_translations', en: 'Category translations', zh: '分类翻译', fields: [field('category_id', 'uuid', 'Category', '产品分类', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('slug', 'string', 'URL slug', '网址别名'), field('name', 'string', 'Name', '名称'), field('description', 'text', 'Description', '描述'), field('seo_title', 'string', 'SEO title', 'SEO标题'), field('meta_description', 'text', 'Meta description', 'Meta描述'), field('primary_keyword', 'string', 'Primary keyword', '主关键词')] },
  { name: 'cms_materials', en: 'Materials', zh: '材料', fields: [tenantField(), statusField(), field('code', 'string', 'Material code', '材料代码'), field('properties', 'json', 'Properties', '材料属性'), field('sort', 'integer', 'Sort', '排序', { schema: { default_value: 10 } })] },
  { name: 'cms_material_translations', en: 'Material translations', zh: '材料翻译', fields: [field('material_id', 'uuid', 'Material', '材料', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('slug', 'string', 'URL slug', '网址别名'), field('name', 'string', 'Name', '名称'), field('description', 'text', 'Description', '描述'), field('buyer_notes', 'text', 'Buyer notes', '买家说明'), field('seo_title', 'string', 'SEO title', 'SEO标题'), field('meta_description', 'text', 'Meta description', 'Meta描述'), field('primary_keyword', 'string', 'Primary keyword', '主关键词')] },
  { name: 'cms_products', en: 'Products', zh: '产品', fields: [tenantField(), statusField(), field('category_id', 'uuid', 'Category', '产品分类', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('product_type', 'string', 'Product type', '产品类型'), field('color', 'string', 'Color', '颜色'), field('swatch', 'string', 'Color swatch', '色卡'), field('image_url', 'string', 'Image URL', '图片地址'), field('display_type', 'string', 'Display type', '展示类型'), field('mood', 'string', 'Mood', '风格'), field('occasion', 'string', 'Occasion', '使用场景'), field('window_shape', 'string', 'Window shape', '窗口形状'), field('collection_size', 'string', 'Collection size', '收藏规模'), field('specifications', 'json', 'Specifications', '规格参数'), field('sort', 'integer', 'Sort', '排序', { schema: { default_value: 10 } })] },
  { name: 'cms_product_translations', en: 'Product translations', zh: '产品翻译', fields: [field('product_id', 'uuid', 'Product', '产品', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('slug', 'string', 'URL slug', '网址别名'), field('name', 'string', 'Name', '名称'), field('description', 'text', 'Description', '描述'), field('note', 'text', 'Buyer note', '买家说明'), field('highlights', 'json', 'Highlights', '产品亮点'), field('planning_points', 'json', 'Planning points', '确认事项'), field('seo_title', 'string', 'SEO title', 'SEO标题'), field('meta_description', 'text', 'Meta description', 'Meta描述'), field('primary_keyword', 'string', 'Primary keyword', '主关键词'), field('secondary_keywords', 'json', 'Secondary keywords', '辅助关键词'), field('search_intent', 'string', 'Search intent', '搜索意图')] },
  { name: 'cms_product_materials', en: 'Product materials', zh: '产品材料关系', fields: [field('product_id', 'uuid', 'Product', '产品', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('material_id', 'uuid', 'Material', '材料', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('is_primary', 'boolean', 'Primary material', '主要材料', { schema: { default_value: false } }), field('notes', 'text', 'Notes', '说明')] },
  { name: 'cms_pages', en: 'Pages', zh: '页面', fields: [tenantField(), statusField(), field('page_type', 'string', 'Page type', '页面类型'), field('sort', 'integer', 'Sort', '排序', { schema: { default_value: 10 } })] },
  { name: 'cms_page_translations', en: 'Page translations', zh: '页面翻译', fields: [field('page_id', 'uuid', 'Page', '页面', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('slug', 'string', 'URL slug', '网址别名'), field('title', 'string', 'Title', '标题'), field('eyebrow', 'string', 'Eyebrow', '眉题'), field('description', 'text', 'Description', '描述'), field('seo_title', 'string', 'SEO title', 'SEO标题'), field('meta_description', 'text', 'Meta description', 'Meta描述'), field('primary_keyword', 'string', 'Primary keyword', '主关键词'), field('secondary_keywords', 'json', 'Secondary keywords', '辅助关键词'), field('search_intent', 'string', 'Search intent', '搜索意图'), field('canonical_override', 'string', 'Canonical override', 'Canonical覆盖'), field('robots', 'string', 'Robots', '索引规则', { schema: { default_value: 'index,follow' } })] },
  { name: 'cms_content_blocks', en: 'Page blocks', zh: '页面组件', fields: [field('page_id', 'uuid', 'Page', '页面', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), statusField(), field('block_type', 'string', 'Component type', '组件类型', { meta: { interface: 'select-dropdown', options: { choices: ['hero', 'product_grid', 'image_text', 'benefits', 'specifications', 'material_comparison', 'process_steps', 'gallery', 'faq', 'related_guides', 'social_proof', 'cta'].map((value) => ({ text: value, value })) } } }), field('settings', 'json', 'Display settings', '显示设置'), field('sort', 'integer', 'Sort', '排序', { schema: { default_value: 10 } })] },
  { name: 'cms_content_block_translations', en: 'Block translations', zh: '组件翻译', fields: [field('content_block_id', 'uuid', 'Page block', '页面组件', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('content', 'json', 'Content', '内容')] },
  { name: 'cms_site_settings', en: 'Site settings', zh: '站点设置', fields: [tenantField(), statusField(), field('base_config', 'json', 'Shared configuration', '通用配置')] },
  { name: 'cms_site_settings_translations', en: 'Site settings translations', zh: '站点设置翻译', fields: [field('site_settings_id', 'uuid', 'Site settings', '站点设置', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('config', 'json', 'Localized configuration', '本地化配置')] },
  { name: 'cms_menus', en: 'Menus', zh: '导航菜单', fields: [tenantField(), statusField(), field('key', 'string', 'Menu key', '菜单标识')] },
  { name: 'cms_menu_items', en: 'Menu items', zh: '菜单项', fields: [field('menu_id', 'uuid', 'Menu', '导航菜单', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('parent_id', 'uuid', 'Parent item', '上级菜单项', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('link_type', 'string', 'Link type', '链接类型'), field('url', 'string', 'URL', '链接地址'), field('reference_type', 'string', 'Reference type', '关联类型'), field('reference_id', 'uuid', 'Reference ID', '关联ID'), field('sort', 'integer', 'Sort', '排序', { schema: { default_value: 10 } }), field('is_visible', 'boolean', 'Visible', '是否显示', { schema: { default_value: true } })] },
  { name: 'cms_menu_item_translations', en: 'Menu item translations', zh: '菜单项翻译', fields: [field('menu_item_id', 'uuid', 'Menu item', '菜单项', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), localeField(), field('label', 'string', 'Label', '显示名称'), field('description', 'text', 'Description', '说明')] },
  { name: 'cms_keyword_targets', en: 'Keyword targets', zh: '关键词布局', fields: [tenantField(), statusField(), localeField(), field('query_cluster', 'string', 'Query cluster', '关键词簇'), field('primary_keyword', 'string', 'Primary keyword', '主关键词'), field('secondary_keywords', 'json', 'Secondary keywords', '辅助关键词'), field('search_intent', 'string', 'Search intent', '搜索意图'), field('target_type', 'string', 'Target type', '目标类型'), field('target_id', 'uuid', 'Target ID', '目标ID'), field('priority', 'integer', 'Priority', '优先级'), field('opportunity_score', 'integer', 'Opportunity score', '机会评分'), field('quality_notes', 'json', 'Quality notes', '质量检查')] },
  { name: 'cms_social_campaigns', en: 'Social campaigns', zh: '社媒活动', fields: [tenantField(), statusField(), field('name', 'string', 'Name', '名称'), field('objective', 'string', 'Objective', '推广目标'), field('locale', 'string', 'Locale', '语言'), field('utm_campaign', 'string', 'UTM campaign', 'UTM活动'), field('source_type', 'string', 'Source type', '来源类型'), field('source_id', 'uuid', 'Source ID', '来源ID')] },
  { name: 'cms_social_posts', en: 'Social posts', zh: '社媒内容', fields: [tenantField(), field('campaign_id', 'uuid', 'Campaign', '社媒活动', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('platform', 'string', 'Platform', '平台'), field('format', 'string', 'Format', '形式'), field('locale', 'string', 'Locale', '语言'), field('caption', 'text', 'Caption', '文案'), field('hashtags', 'json', 'Hashtags', '标签'), field('media', 'json', 'Media', '媒体'), field('status', 'string', 'Status', '状态', { schema: { default_value: 'idea' } }), field('scheduled_at', 'timestamp', 'Scheduled at', '计划时间'), field('external_post_id', 'string', 'External post ID', '平台内容ID'), field('external_url', 'string', 'External URL', '平台链接'), field('metrics', 'json', 'Metrics', '数据指标')] },
  { name: 'cms_inquiries', en: 'Inquiries', zh: '询盘', fields: [tenantField(), field('status', 'string', 'Status', '状态', { schema: { default_value: 'new' } }), field('name', 'string', 'Name', '姓名'), field('email', 'string', 'Email', '邮箱'), field('locale', 'string', 'Locale', '语言'), field('source_url', 'string', 'Source URL', '来源页面'), field('product_id', 'uuid', 'Product', '产品', { meta: { interface: 'select-dropdown-m2o', special: ['m2o'] } }), field('message', 'text', 'Message', '需求说明'), field('payload', 'json', 'Structured request', '结构化需求'), field('utm', 'json', 'UTM', 'UTM参数'), field('consent_at', 'timestamp', 'Consent at', '同意时间')] },
];

const existingCollections = new Set((await request('/collections')).data.map((item) => item.collection));
for (const definition of collections) {
  if (!existingCollections.has(definition.name)) {
    await request('/collections', { method: 'POST', body: JSON.stringify({
      collection: definition.name,
      meta: { icon: 'article', note: definition.en, translations: labels(definition.en, definition.zh) },
      schema: {},
      fields: [{ field: 'id', type: 'uuid', meta: { hidden: true, readonly: true, special: ['uuid'], interface: 'input' }, schema: { is_primary_key: true } }],
    }) });
  }
  const existingFields = new Set((await request(`/fields/${definition.name}`)).data.map((item) => item.field));
  for (const definitionField of definition.fields) {
    if (!existingFields.has(definitionField.field)) {
      await request(`/fields/${definition.name}`, { method: 'POST', body: JSON.stringify(definitionField) });
    }
  }
}

const relations = [
  ['cms_categories', 'tenant_id', 'cms_tenants'], ['cms_materials', 'tenant_id', 'cms_tenants'],
  ['cms_products', 'tenant_id', 'cms_tenants'], ['cms_products', 'category_id', 'cms_categories'], ['cms_pages', 'tenant_id', 'cms_tenants'],
  ['cms_site_settings', 'tenant_id', 'cms_tenants'], ['cms_keyword_targets', 'tenant_id', 'cms_tenants'],
  ['cms_menus', 'tenant_id', 'cms_tenants'], ['cms_social_campaigns', 'tenant_id', 'cms_tenants'], ['cms_social_posts', 'tenant_id', 'cms_tenants'], ['cms_inquiries', 'tenant_id', 'cms_tenants'],
  ['cms_categories', 'parent_id', 'cms_categories'], ['cms_category_translations', 'category_id', 'cms_categories'], ['cms_material_translations', 'material_id', 'cms_materials'],
  ['cms_product_translations', 'product_id', 'cms_products'], ['cms_page_translations', 'page_id', 'cms_pages'],
  ['cms_product_materials', 'product_id', 'cms_products'], ['cms_product_materials', 'material_id', 'cms_materials'],
  ['cms_content_blocks', 'page_id', 'cms_pages'], ['cms_content_block_translations', 'content_block_id', 'cms_content_blocks'],
  ['cms_site_settings_translations', 'site_settings_id', 'cms_site_settings'],
  ['cms_menu_items', 'menu_id', 'cms_menus'], ['cms_menu_items', 'parent_id', 'cms_menu_items'], ['cms_menu_item_translations', 'menu_item_id', 'cms_menu_items'],
  ['cms_social_posts', 'campaign_id', 'cms_social_campaigns'], ['cms_inquiries', 'product_id', 'cms_products'],
];
const existingRelations = new Set((await request('/relations')).data.map((item) => `${item.collection}.${item.field}`));
for (const [collection, relationField, relatedCollection] of relations) {
  if (!existingRelations.has(`${collection}.${relationField}`)) {
    await request('/relations', { method: 'POST', body: JSON.stringify({ collection, field: relationField, related_collection: relatedCollection, schema: { on_delete: 'CASCADE' } }) });
  }
}

async function findOne(collection, filter) {
  const result = await request(`/items/${collection}?filter=${encodeURIComponent(JSON.stringify(filter))}&limit=1`);
  return result.data[0];
}
async function create(collection, data) {
  return (await request(`/items/${collection}`, { method: 'POST', body: JSON.stringify(data) })).data;
}

let tenant = await findOne('cms_tenants', { slug: { _eq: 'ita-bag-lab' } });
if (!tenant) tenant = await create('cms_tenants', { slug: 'ita-bag-lab', name: 'Ita Bag Design Lab', primary_locale: 'en-US', available_locales: ['en-US', 'zh-CN'], status: 'active' });

let settings = await findOne('cms_site_settings', { tenant_id: { _eq: tenant.id } });
if (!settings) settings = await create('cms_site_settings', { tenant_id: tenant.id, status: 'published', base_config: { seo: { indexable: false }, brand: { name: 'ITA', suffix: 'ATELIER' } } });
for (const translation of [
  { languages_code: 'en-US', config: { brand: { name: 'ITA', suffix: 'ATELIER', tagline: 'Custom ita bag concepts shaped around the things people collect.' } } },
  { languages_code: 'zh-CN', config: { brand: { name: 'ITA', suffix: 'ATELIER', tagline: '围绕你的收藏，设计专属痛包。' }, navigation: { bags: '痛包系列', create: '开始设计', studio: '设计工坊', guides: '选购指南', cta: '定制痛包' } } },
]) {
  const found = await findOne('cms_site_settings_translations', { site_settings_id: { _eq: settings.id }, languages_code: { _eq: translation.languages_code } });
  if (!found) await create('cms_site_settings_translations', { site_settings_id: settings.id, ...translation });
}

const seedProducts = [
  { key: 'sweetheart', sort: 10, facts: { product_type: 'Backpack', color: 'Blush pink', swatch: '#eaa8bc', image_url: '/images/heart.webp', display_type: 'Pins', mood: 'Playful', occasion: 'Conventions', window_shape: 'Heart', collection_size: 'Large' }, en: { name: 'The Sweetheart', description: 'A heart-shaped frame for the little things you love.', note: 'Start with one focal pin and leave breathing room around the edge.', primary_keyword: 'heart ita backpack' }, zh: { name: '甜心痛包', description: '心形展示窗，为喜爱的徽章与纪念物留出主角位置。', note: '先确定一枚主徽章，再围绕它安排较小配件。', primary_keyword: '心形痛包' } },
  { key: 'mint-story', sort: 20, facts: { product_type: 'Crossbody', color: 'Mint green', swatch: '#abcbbd', image_url: '/images/mint.webp', display_type: 'Photocards', mood: 'Soft', occasion: 'Everyday', window_shape: 'Rectangle', collection_size: 'Small' }, en: { name: 'Mint Story', description: 'A fresh mint palette and a clean window for favorite photocards.', note: 'Use protective sleeves and confirm usable window dimensions.', primary_keyword: 'photocard ita crossbody bag' }, zh: { name: '薄荷故事', description: '清新的薄荷色与简洁展示窗，适合随身携带喜爱的拍立得卡。', note: '使用保护套，并提前确认展示窗的可用尺寸。', primary_keyword: '拍立得卡痛包' } },
  { key: 'after-hours', sort: 30, facts: { product_type: 'Tote', color: 'Black', swatch: '#25282b', image_url: '/images/noir.webp', display_type: 'Pins', mood: 'Minimal', occasion: 'Everyday', window_shape: 'Rectangle', collection_size: 'Medium' }, en: { name: 'After Hours', description: 'A quieter black canvas for a collection with personality.', note: 'Repeat one metal finish and use a dark insert for contrast.', primary_keyword: 'black ita tote bag' }, zh: { name: '午夜之后', description: '低调的黑色画布，让收藏细节成为视觉焦点。', note: '统一五金颜色，并用深色内衬衬托金属细节。', primary_keyword: '黑色痛包托特包' } },
];
for (const seed of seedProducts) {
  let product = await findOne('cms_product_translations', { slug: { _eq: seed.key }, languages_code: { _eq: 'en-US' } });
  let productId = product?.product_id;
  if (!productId) productId = (await create('cms_products', { tenant_id: tenant.id, status: 'published', sort: seed.sort, ...seed.facts })).id;
  for (const [languages_code, copy] of [['en-US', seed.en], ['zh-CN', seed.zh]]) {
    const found = await findOne('cms_product_translations', { product_id: { _eq: productId }, languages_code: { _eq: languages_code } });
    if (!found) await create('cms_product_translations', { product_id: productId, languages_code, slug: seed.key, search_intent: 'commercial_inspiration', highlights: [], planning_points: [], ...copy });
  }
}

console.log(`Directus V1 schema and starter content are ready at ${baseUrl}`);
