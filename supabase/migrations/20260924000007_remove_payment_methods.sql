-- 7/12 · Remove payment methods (feature dropped)
-- Only does something on databases created before payment methods were
-- removed; on a new database every statement below is a no-op.
-- The old "payment-method-images" storage bucket can't be removed with SQL.
-- If it exists, delete it in Dashboard → Storage (nothing can upload to it).

drop table if exists public.course_payment_methods, public.payment_methods cascade;

update public.faqs
set answer = 'We accept eSewa, Khalti, Fonepay and bank transfer. Our team confirms how you will pay after you enroll, and any instalment plan is shown on the course page.'
where question = 'Which payment methods do you accept?'
  and answer = 'We accept eSewa, Khalti, Fonepay and bank transfer. The methods available for each course, and any instalment plan, are listed on the course page.';
