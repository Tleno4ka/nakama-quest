import { useEffect, useState } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Search, Users, MessageCircle, Zap, Shield, Calendar,
  Heart, Filter, UserPlus, Gamepad2, ChevronDown, ChevronUp,
  Star, Send, Check, X, Crown, Sparkles, ArrowRight,
  Mail, MessageSquare
} from "lucide-react";
import { useRef } from "react";
import heroMockup from "@/assets/hero-mockup-web.jpg";
import { supabase } from "@/integrations/supabase/client";

/* ─── animation helpers ─── */
const spring = { type: "spring" as const, stiffness: 260, damping: 28 };
const fadeUp = { hidden: { opacity: 0, y: 32 }, visible: { opacity: 1, y: 0 } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
const scaleIn = { hidden: { opacity: 0, scale: 0.92 }, visible: { opacity: 1, scale: 1 } };

function Section({ children, className = "", id }: { children: React.ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });
  return (
    <motion.section
      ref={ref}
      id={id}
      initial="hidden"
      animate={inView ? "visible" : "hidden"}
      variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ─── data ─── */
const steps = [
  { icon: UserPlus, title: "Создай профиль", desc: "Укажи свои игры, ранг и стиль" },
  { icon: Filter, title: "Выбери фильтры", desc: "Игра, язык, время — настрой под себя" },
  { icon: Gamepad2, title: "Свайпай", desc: "Листай карточки и выбирай" },
  { icon: Heart, title: "Мэтчься", desc: "Взаимный лайк = новый напарник" },
  { icon: MessageCircle, title: "Играй вместе", desc: "Общайся и побеждай в команде" },
];

const benefits = [
  { icon: Zap, title: "Быстрый поиск", desc: "2–3 минуты до идеального тиммейта. Никаких форумов и чатов." },
  { icon: Filter, title: "Умные фильтры", desc: "Игра, ранг, язык, время — находи именно тех, кто подходит." },
  { icon: Heart, title: "Только взаимные мэтчи", desc: "Никакого спама. Общение начинается, только если вы понравились друг другу." },
  { icon: Shield, title: "Безопасность", desc: "Модерация, система жалоб и рейтинги — токсичным здесь не место." },
  { icon: Calendar, title: "Календарь доступности", desc: "Видишь, когда игрок онлайн — планируй сессии заранее." },
  { icon: Search, title: "Совместимость", desc: "Алгоритм учитывает стиль игры, время и предпочтения." },
];

const plans = [
  {
    name: "Бесплатный",
    price: "0 ₽",
    period: "навсегда",
    desc: "Полный доступ с рекламой",
    features: [
      { text: "Все основные функции", included: true },
      { text: "До 30 лайков в день", included: true },
      { text: "Чат с мэтчами", included: true },
      { text: "Показ рекламы", included: true },
      { text: "Просмотр лайков", included: false },
      { text: "Приоритет в поиске", included: false },
    ],
    accent: false,
  },
  {
    name: "Premium",
    price: "299 ₽",
    period: "/мес",
    desc: "Максимум без ограничений",
    badge: "Популярный",
    features: [
      { text: "Всё из бесплатного", included: true },
      { text: "Без рекламы", included: true },
      { text: "Безлимитные лайки", included: true },
      { text: "Просмотр лайков без мэтча", included: true },
      { text: "Приоритет в поиске", included: true },
      { text: "Буст профиля", included: false },
    ],
    accent: true,
  },
  {
    name: "Pro",
    price: "499 ₽",
    period: "/мес",
    desc: "Для хардкорных игроков",
    features: [
      { text: "Всё из Premium", included: true },
      { text: "Буст профиля 3×", included: true },
      { text: "Расширенные фильтры", included: true },
      { text: "Ранний доступ к фичам", included: true },
      { text: "Эксклюзивный бейдж", included: true },
      { text: "Приоритетная поддержка", included: true },
    ],
    accent: false,
  },
];

const faqs = [
  { q: "Это бесплатно?", a: "Да! Все основные функции доступны бесплатно. Мы зарабатываем на рекламе, а подписка просто улучшает опыт — убирает рекламу и снимает лимиты." },
  { q: "Как работают мэтчи?", a: "Ты свайпаешь карточки игроков. Если оба ставят лайк — мэтч! Появляется чат, и вы можете договориться об игре." },
  { q: "Безопасно ли приложение?", a: "Да. У нас есть система жалоб, модерация и рейтинги. Токсичные пользователи получают бан." },
  { q: "Можно ли играть с друзьями?", a: "Конечно! Ты можешь пригласить друзей по ссылке и добавить их в список мэтчей." },
  { q: "Есть ли мобильная версия?", a: "Nakama работает как веб-приложение и отлично адаптирован под мобильные устройства. Нативное приложение скоро!" },
  { q: "Как отключить рекламу?", a: "Подпишись на Premium или Pro — реклама исчезнет, а лимиты на лайки будут сняты." },
  { q: "Какие игры поддерживаются?", a: "Valorant, CS2, Dota 2, League of Legends, Apex Legends и многие другие. Список постоянно растёт!" },
];

const testimonials = [
  { name: "Алексей", game: "Valorant", text: "Нашёл двоих тиммейтов за первый вечер. Теперь играем каждый день!", rating: 5 },
  { name: "Марина", game: "Dota 2", text: "Наконец-то не нужно играть с рандомами. Nakama — топ!", rating: 5 },
  { name: "Даниил", game: "CS2", text: "Удобные фильтры и быстрые мэтчи. Рекомендую всем!", rating: 5 },
  { name: "Анна", game: "Apex Legends", text: "Приложение красивое и простое. Нашла команду за 5 минут.", rating: 4 },
];

const stats = [
  { value: "10 000+", label: "игроков" },
  { value: "50 000+", label: "мэтчей" },
  { value: "20+", label: "игр" },
  { value: "4.8★", label: "оценка" },
];

/* ─── component ─── */
export default function Landing() {
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" });
  const [contactLoading, setContactLoading] = useState(false);

  useEffect(() => {
    if (!loading && user) navigate("/swipe", { replace: true });
  }, [user, loading, navigate]);

  const cta = () => navigate("/register");

  return (
    <div className="flex min-h-screen flex-col bg-background overflow-x-hidden">
      {/* ════════ HEADER ════════ */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-8">
          <span className="text-xl font-extrabold tracking-tight text-white sm:text-2xl">
            Nakama
          </span>
          <nav className="hidden items-center gap-6 text-sm text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">Как это работает</a>
            <a href="#pricing" className="transition-colors hover:text-foreground">Тарифы</a>
            <a href="#faq" className="transition-colors hover:text-foreground">FAQ</a>
          </nav>
          <div className="flex gap-2 sm:gap-3">
            <Button variant="ghost" size="sm" onClick={() => navigate("/login")}>Войти</Button>
            <Button variant="hero" size="sm" onClick={cta}>Начать</Button>
          </div>
        </div>
      </header>

      {/* ════════ HERO ════════ */}
      <Section className="relative mx-auto flex w-full max-w-7xl flex-col-reverse items-center gap-10 px-4 pb-16 pt-12 sm:px-8 md:flex-row md:gap-16 md:pb-28 md:pt-20 lg:pt-28">
        <motion.div variants={fadeUp} transition={spring} className="flex-1 text-center md:text-left">
          <h1 className="text-3xl font-extrabold leading-[1.1] text-foreground sm:text-4xl md:text-5xl lg:text-6xl">
            <span className="whitespace-nowrap">Играй не в одиночку</span> —{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              находи идеальных тиммейтов
            </span>{" "}
            за секунды
          </h1>
          <p className="mt-5 max-w-lg text-base text-muted-foreground sm:text-lg md:mx-0 mx-auto">
            Умные фильтры, быстрые мэтчи, живой чат. Забудь про рандомов — собери
            команду мечты в пару свайпов.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center md:justify-start">
            <Button variant="hero" size="lg" onClick={cta} className="group">
              Начать бесплатно
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
          {/* mini stats */}
          <div className="mt-10 flex flex-wrap justify-center gap-6 md:justify-start">
            {stats.map((s) => (
              <div key={s.label} className="text-center">
                <p className="text-xl font-bold text-foreground">{s.value}</p>
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
        <motion.div variants={scaleIn} transition={spring} className="relative flex-1 flex justify-center">
          <div className="relative w-full max-w-lg">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-2xl" />
            <img
              src={heroMockup}
              alt="Nakama — веб-приложение для поиска тиммейтов"
              width={1280}
              height={800}
              className="relative w-full rounded-2xl shadow-2xl"
            />
          </div>
        </motion.div>
      </Section>

      {/* ════════ HOW IT WORKS ════════ */}
      <Section id="how" className="mx-auto max-w-5xl px-4 py-20 sm:px-8">
        <motion.h2 variants={fadeUp} transition={spring} className="text-center text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl">
          Как это работает
        </motion.h2>
        <motion.p variants={fadeUp} transition={spring} className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          От регистрации до первой игры — 5 простых шагов
        </motion.p>
        <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-5">
          {steps.map((s, i) => (
            <motion.div
              key={s.title}
              variants={fadeUp}
              transition={{ ...spring, delay: i * 0.08 }}
              className="group relative flex flex-col items-center rounded-2xl bg-card p-6 text-center shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <s.icon className="h-7 w-7" />
              </div>
              <span className="absolute -top-3 left-4 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                {i + 1}
              </span>
              <h3 className="text-sm font-bold text-foreground">{s.title}</h3>
              <p className="mt-1 text-xs text-muted-foreground">{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════ BENEFITS ════════ */}
      <Section className="mx-auto max-w-6xl px-4 py-20 sm:px-8">
        <motion.h2 variants={fadeUp} transition={spring} className="text-center text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl">
          Почему Nakama
        </motion.h2>
        <motion.p variants={fadeUp} transition={spring} className="mx-auto mt-3 max-w-md text-center text-muted-foreground">
          Всё, что нужно для поиска команды — в одном месте
        </motion.p>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => (
            <motion.div
              key={b.title}
              variants={fadeUp}
              transition={{ ...spring, delay: i * 0.06 }}
              className="group rounded-2xl bg-card p-6 shadow-card transition-all hover:shadow-card-hover"
            >
              <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
                <b.icon className="h-6 w-6" />
              </div>
              <h3 className="text-base font-bold text-foreground">{b.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground leading-relaxed">{b.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════ PRICING ════════ */}
      <Section id="pricing" className="mx-auto max-w-5xl px-4 py-20 sm:px-8">
        <motion.h2 variants={fadeUp} transition={spring} className="text-center text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl">
          Тарифы
        </motion.h2>
        <motion.p variants={fadeUp} transition={spring} className="mx-auto mt-3 max-w-lg text-center text-muted-foreground">
          Основные функции бесплатны — мы зарабатываем на рекламе. Подписка делает опыт ещё лучше.
        </motion.p>
        <div className="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              variants={scaleIn}
              transition={{ ...spring, delay: i * 0.1 }}
              className={`relative flex flex-col rounded-2xl p-6 transition-all ${
                plan.accent
                  ? "bg-gradient-to-b from-primary/15 to-card ring-2 ring-primary shadow-[0_0_40px_-12px_hsl(var(--primary)/0.3)]"
                  : "bg-card shadow-card hover:shadow-card-hover"
              }`}
            >
              {plan.badge && (
                <span className="absolute -top-3 right-4 rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                  {plan.badge}
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                <p className="text-xs text-muted-foreground">{plan.desc}</p>
              </div>
              <div className="mb-6">
                <span className="text-4xl font-extrabold text-foreground">{plan.price}</span>
                <span className="ml-1 text-sm text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2 text-sm">
                    {f.included ? (
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                    ) : (
                      <X className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                    )}
                    <span className={f.included ? "text-foreground" : "text-muted-foreground/50"}>{f.text}</span>
                  </li>
                ))}
              </ul>
              <Button
                variant={plan.accent ? "hero" : "outline"}
                className="w-full"
                onClick={cta}
              >
                {plan.accent ? "Выбрать Premium" : "Начать"}
              </Button>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════ TESTIMONIALS ════════ */}
      <Section className="mx-auto max-w-5xl px-4 py-20 sm:px-8">
        <motion.h2 variants={fadeUp} transition={spring} className="text-center text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl">
          Что говорят игроки
        </motion.h2>
        <div className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              variants={fadeUp}
              transition={{ ...spring, delay: i * 0.08 }}
              className="rounded-2xl bg-card p-5 shadow-card"
            >
              <div className="mb-2 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed">«{t.text}»</p>
              <div className="mt-3 border-t border-border pt-3">
                <p className="text-sm font-semibold text-foreground">{t.name}</p>
                <p className="text-xs text-muted-foreground">{t.game}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════ FAQ ════════ */}
      <Section id="faq" className="mx-auto max-w-3xl px-4 py-20 sm:px-8">
        <motion.h2 variants={fadeUp} transition={spring} className="text-center text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl">
          Частые вопросы
        </motion.h2>
        <div className="mt-12 space-y-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              variants={fadeUp}
              transition={{ ...spring, delay: i * 0.05 }}
              className="rounded-xl bg-card shadow-card overflow-hidden"
            >
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="flex w-full items-center justify-between p-5 text-left text-sm font-semibold text-foreground transition-colors hover:text-primary"
              >
                {faq.q}
                {openFaq === i ? <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" /> : <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />}
              </button>
              <motion.div
                initial={false}
                animate={{ height: openFaq === i ? "auto" : 0, opacity: openFaq === i ? 1 : 0 }}
                transition={{ duration: 0.25, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </Section>

      {/* ════════ CTA REPEAT ════════ */}
      <Section className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-8">
        <motion.div
          variants={scaleIn}
          transition={spring}
          className="relative rounded-3xl bg-gradient-to-br from-primary/15 via-card to-accent/10 p-10 shadow-card sm:p-16"
        >
          <div className="absolute -inset-1 rounded-3xl bg-gradient-to-br from-primary/20 to-accent/20 blur-xl opacity-50" />
          <div className="relative">
            <Sparkles className="mx-auto mb-4 h-10 w-10 text-primary" />
            <h2 className="text-2xl font-extrabold text-foreground sm:text-3xl lg:text-4xl">
              Начни играть с командой уже сегодня
            </h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Присоединяйся к тысячам игроков, которые уже нашли свою команду.
            </p>
            <Button variant="hero" size="lg" className="mt-8 group" onClick={cta}>
              Найти тиммейта
              <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>
        </motion.div>
      </Section>

      {/* ════════ CONTACT ════════ */}
      <Section id="contact" className="mx-auto max-w-3xl px-4 py-20 sm:px-8">
        <motion.h2 variants={fadeUp} transition={spring} className="text-center text-2xl font-extrabold text-foreground sm:text-3xl">
          Связаться с нами
        </motion.h2>
        <motion.div variants={fadeUp} transition={spring} className="mt-4 flex flex-wrap justify-center gap-6 text-sm text-muted-foreground">
          <a href="mailto:hello@nakama.app" className="flex items-center gap-2 transition-colors hover:text-foreground">
            <Mail className="h-4 w-4" /> hello@nakama.app
          </a>
          <a href="https://t.me/nakama_support" target="_blank" rel="noreferrer" className="flex items-center gap-2 transition-colors hover:text-foreground">
            <MessageSquare className="h-4 w-4" /> @nakama_support
          </a>
        </motion.div>
        <motion.form
          variants={fadeUp}
          transition={spring}
          onSubmit={async (e) => {
            e.preventDefault();
            if (!contactForm.name.trim() || !contactForm.email.trim() || !contactForm.message.trim()) return;
            setContactLoading(true);
            const { error } = await supabase.from("contact_messages").insert({
              name: contactForm.name.trim(),
              email: contactForm.email.trim(),
              message: contactForm.message.trim(),
            });
            setContactLoading(false);
            if (error) {
              alert("Ошибка отправки. Попробуйте позже.");
            } else {
              alert("Сообщение отправлено!");
              setContactForm({ name: "", email: "", message: "" });
            }
          }}
          className="mt-10 space-y-4 rounded-2xl bg-card p-6 shadow-card sm:p-8"
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="text"
              placeholder="Имя"
              value={contactForm.name}
              onChange={(e) => setContactForm((f) => ({ ...f, name: e.target.value }))}
              className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-input-focus transition-shadow"
            />
            <input
              type="email"
              placeholder="Email"
              value={contactForm.email}
              onChange={(e) => setContactForm((f) => ({ ...f, email: e.target.value }))}
              className="rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-input-focus transition-shadow"
            />
          </div>
          <textarea
            placeholder="Сообщение"
            rows={4}
            value={contactForm.message}
            onChange={(e) => setContactForm((f) => ({ ...f, message: e.target.value }))}
            className="w-full rounded-xl border border-border bg-input px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:shadow-input-focus transition-shadow resize-none"
          />
          <Button variant="hero" className="w-full sm:w-auto group" type="submit" disabled={contactLoading}>
            {contactLoading ? "Отправка..." : "Отправить"} <Send className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </motion.form>
      </Section>

      {/* ════════ FOOTER ════════ */}
      <footer className="border-t border-border bg-card/50">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-6 px-4 py-10 sm:flex-row sm:justify-between sm:px-8">
          <span className="text-lg font-extrabold tracking-tight text-white">
            Nakama
          </span>
          <nav className="flex flex-wrap justify-center gap-5 text-xs text-muted-foreground">
            <a href="#" className="transition-colors hover:text-foreground">Privacy Policy</a>
            <a href="#" className="transition-colors hover:text-foreground">Terms of Service</a>
            <a href="#contact" className="transition-colors hover:text-foreground">Контакты</a>
          </nav>
          <p className="text-xs text-muted-foreground">© 2026 Nakama. Все права защищены.</p>
        </div>
      </footer>
    </div>
  );
}
