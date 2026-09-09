-- Deterministic development-only seed. It intentionally creates no auth user.
-- Add a local user through Supabase Studio, then add tenant_membership manually.

insert into public.tenants (id, slug, name)
values ('00000000-0000-4000-8000-000000000001', 'ita-bag-lab', 'Ita Bag Design Lab')
on conflict (id) do nothing;

insert into public.strategy_profiles (
  id, tenant_id, version, business_model, primary_channels, primary_intents,
  secondary_intents, low_priority_intents, allowed_page_types, publishing_mode
)
values (
  '00000000-0000-4000-8000-000000000010',
  '00000000-0000-4000-8000-000000000001',
  1,
  'design_driven_custom',
  array['google_search', 'google_images', 'pinterest', 'instagram', 'tiktok'],
  array['custom', 'design', 'style', 'feature', 'application', 'inspiration'],
  array['small_batch', 'wholesale', 'group_order', 'private_label'],
  array['manufacturer', 'factory', 'supplier'],
  array['category', 'commercial', 'product', 'customization', 'component', 'material', 'application', 'design_inspiration', 'comparison', 'guide', 'gallery'],
  'review_required'
)
on conflict (id) do nothing;

insert into public.topics (id, tenant_id, name, slug, entity_type)
values
  ('10000000-0000-4000-8000-000000000001', '00000000-0000-4000-8000-000000000001', 'Ita Bag', 'ita-bag', 'product_category'),
  ('10000000-0000-4000-8000-000000000002', '00000000-0000-4000-8000-000000000001', 'Ita Backpack', 'ita-backpack', 'product_type'),
  ('10000000-0000-4000-8000-000000000003', '00000000-0000-4000-8000-000000000001', 'Ita Tote', 'ita-tote', 'product_type'),
  ('10000000-0000-4000-8000-000000000004', '00000000-0000-4000-8000-000000000001', 'Clear Window', 'clear-window', 'feature'),
  ('10000000-0000-4000-8000-000000000005', '00000000-0000-4000-8000-000000000001', 'Detachable Insert', 'detachable-insert', 'component'),
  ('10000000-0000-4000-8000-000000000006', '00000000-0000-4000-8000-000000000001', 'PVC', 'pvc', 'material'),
  ('10000000-0000-4000-8000-000000000007', '00000000-0000-4000-8000-000000000001', 'Enamel Pins', 'enamel-pins', 'application'),
  ('10000000-0000-4000-8000-000000000008', '00000000-0000-4000-8000-000000000001', 'Photocards', 'photocards', 'application'),
  ('10000000-0000-4000-8000-000000000009', '00000000-0000-4000-8000-000000000001', 'Plushies', 'plushies', 'application')
on conflict (id) do nothing;

insert into public.topic_relations (
  tenant_id, source_topic_id, target_topic_id, relation_type
)
values
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000002', 'has_product_type'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000003', 'has_product_type'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', 'has_feature'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000005', 'has_component'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000004', '10000000-0000-4000-8000-000000000006', 'commonly_uses_material'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000007', 'supports_application'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000008', 'supports_application'),
  ('00000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000001', '10000000-0000-4000-8000-000000000009', 'supports_application')
on conflict (tenant_id, source_topic_id, target_topic_id, relation_type) do nothing;
