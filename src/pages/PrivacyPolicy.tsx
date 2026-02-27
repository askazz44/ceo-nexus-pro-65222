import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicy() {
  const { t, language } = useTranslation();

  return (
    <div className="min-h-screen bg-background">
      <div className="container max-w-3xl py-8 px-4">
        <div className="mb-8">
          <Link to="/">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              {t('backToHome')}
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {language === 'it' ? 'Informativa sulla Privacy' : 'Privacy Policy'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'it' ? 'Ultimo aggiornamento: 27 Febbraio 2026' : 'Last updated: February 27, 2026'}
          </p>
        </div>

        {language === 'it' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Titolare del Trattamento</h2>
              <p className="text-muted-foreground">
                Il titolare del trattamento dei dati è Ascanio Vecchio, contattabile all'indirizzo email: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Dati Raccolti</h2>
              <p className="text-muted-foreground">GainFlow raccoglie i seguenti dati personali:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Dati di registrazione:</strong> indirizzo email, nome completo (opzionale)</li>
                <li><strong>Dati finanziari:</strong> transazioni, categorie, note e importi inseriti dall'utente nei propri progetti</li>
                <li><strong>Dati di pagamento:</strong> gestiti interamente da Stripe Inc. Non memorizziamo numeri di carta di credito</li>
                <li><strong>Dati tecnici:</strong> log di accesso, tipo di dispositivo, indirizzo IP (per sicurezza)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Finalità del Trattamento</h2>
              <p className="text-muted-foreground">I dati vengono trattati per:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Fornire e mantenere il servizio GainFlow</li>
                <li>Gestire l'account utente e l'autenticazione</li>
                <li>Elaborare i pagamenti degli abbonamenti tramite Stripe</li>
                <li>Inviare comunicazioni di servizio (es. reset password)</li>
                <li>Migliorare il servizio attraverso analisi anonime aggregate</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Base Giuridica</h2>
              <p className="text-muted-foreground">
                Il trattamento è basato sul consenso dell'utente (art. 6.1.a GDPR) e sull'esecuzione del contratto di servizio (art. 6.1.b GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Condivisione dei Dati</h2>
              <p className="text-muted-foreground">I dati possono essere condivisi con:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Stripe Inc.</strong> — per l'elaborazione dei pagamenti</li>
                <li><strong>Supabase Inc.</strong> — per l'hosting del database e l'autenticazione</li>
                <li><strong>Plausible Analytics</strong> — per analisi aggregate anonime (privacy-friendly, senza cookie)</li>
              </ul>
              <p className="text-muted-foreground">Non vendiamo né condividiamo i tuoi dati con terze parti per scopi di marketing.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Conservazione dei Dati</h2>
              <p className="text-muted-foreground">
                I dati vengono conservati per tutta la durata dell'account. In caso di cancellazione dell'account, tutti i dati vengono eliminati definitivamente entro 30 giorni.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Diritti dell'Utente (GDPR)</h2>
              <p className="text-muted-foreground">Ai sensi del Regolamento UE 2016/679, l'utente ha diritto a:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Accesso</strong> — richiedere copia dei propri dati</li>
                <li><strong>Rettifica</strong> — correggere dati inesatti</li>
                <li><strong>Cancellazione</strong> — eliminare i propri dati ("diritto all'oblio")</li>
                <li><strong>Portabilità</strong> — ottenere i dati in formato leggibile (CSV/JSON)</li>
                <li><strong>Opposizione</strong> — opporsi al trattamento</li>
                <li><strong>Limitazione</strong> — limitare il trattamento in determinati casi</li>
              </ul>
              <p className="text-muted-foreground">
                Per esercitare questi diritti, contattare: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Sicurezza</h2>
              <p className="text-muted-foreground">
                Utilizziamo misure di sicurezza tecniche e organizzative per proteggere i dati, incluse crittografia in transito (HTTPS/TLS), Row Level Security sul database e autenticazione sicura con verifica email.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Cookie</h2>
              <p className="text-muted-foreground">
                GainFlow utilizza esclusivamente cookie tecnici necessari per il funzionamento dell'app (sessione di autenticazione). Non utilizziamo cookie di profilazione o di terze parti per il tracciamento. Plausible Analytics funziona senza cookie.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Modifiche</h2>
              <p className="text-muted-foreground">
                Ci riserviamo il diritto di aggiornare questa informativa. Le modifiche saranno comunicate tramite l'app. L'uso continuato del servizio costituisce accettazione delle modifiche.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Contatti</h2>
              <p className="text-muted-foreground">
                Per qualsiasi domanda sulla privacy: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Data Controller</h2>
              <p className="text-muted-foreground">
                The data controller is Ascanio Vecchio, reachable at: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Data We Collect</h2>
              <p className="text-muted-foreground">GainFlow collects the following personal data:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Registration data:</strong> email address, full name (optional)</li>
                <li><strong>Financial data:</strong> transactions, categories, notes, and amounts entered by the user</li>
                <li><strong>Payment data:</strong> managed entirely by Stripe Inc. We do not store credit card numbers</li>
                <li><strong>Technical data:</strong> access logs, device type, IP address (for security purposes)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Purpose of Processing</h2>
              <p className="text-muted-foreground">Data is processed to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Provide and maintain the GainFlow service</li>
                <li>Manage user accounts and authentication</li>
                <li>Process subscription payments through Stripe</li>
                <li>Send service communications (e.g., password resets)</li>
                <li>Improve the service through anonymous aggregate analytics</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Legal Basis</h2>
              <p className="text-muted-foreground">
                Processing is based on user consent (Art. 6.1.a GDPR) and performance of the service contract (Art. 6.1.b GDPR).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Data Sharing</h2>
              <p className="text-muted-foreground">Data may be shared with:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Stripe Inc.</strong> — for payment processing</li>
                <li><strong>Supabase Inc.</strong> — for database hosting and authentication</li>
                <li><strong>Plausible Analytics</strong> — for anonymous aggregate analytics (privacy-friendly, no cookies)</li>
              </ul>
              <p className="text-muted-foreground">We do not sell or share your data with third parties for marketing purposes.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Data Retention</h2>
              <p className="text-muted-foreground">
                Data is retained for the duration of the account. Upon account deletion, all data is permanently removed within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Your Rights (GDPR)</h2>
              <p className="text-muted-foreground">Under EU Regulation 2016/679, you have the right to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Access</strong> — request a copy of your data</li>
                <li><strong>Rectification</strong> — correct inaccurate data</li>
                <li><strong>Erasure</strong> — delete your data ("right to be forgotten")</li>
                <li><strong>Portability</strong> — obtain your data in a readable format (CSV/JSON)</li>
                <li><strong>Objection</strong> — object to processing</li>
                <li><strong>Restriction</strong> — restrict processing in certain cases</li>
              </ul>
              <p className="text-muted-foreground">
                To exercise these rights, contact: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Security</h2>
              <p className="text-muted-foreground">
                We use technical and organizational security measures including encryption in transit (HTTPS/TLS), Row Level Security on the database, and secure authentication with email verification.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Cookies</h2>
              <p className="text-muted-foreground">
                GainFlow only uses essential technical cookies for app functionality (authentication session). We do not use profiling or third-party tracking cookies. Plausible Analytics works without cookies.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Changes</h2>
              <p className="text-muted-foreground">
                We reserve the right to update this policy. Changes will be communicated through the app. Continued use of the service constitutes acceptance of changes.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Contact</h2>
              <p className="text-muted-foreground">
                For any privacy questions: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
