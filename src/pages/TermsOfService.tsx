import { useTranslation } from "@/lib/i18n";
import { ArrowLeft, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function TermsOfService() {
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
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">
              {language === 'it' ? 'Termini di Servizio' : 'Terms of Service'}
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'it' ? 'Ultimo aggiornamento: 27 Febbraio 2026' : 'Last updated: February 27, 2026'}
          </p>
        </div>

        {language === 'it' ? (
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Accettazione dei Termini</h2>
              <p className="text-muted-foreground">
                Utilizzando GainFlow, l'utente accetta integralmente i presenti Termini di Servizio. Se non si accettano questi termini, si prega di non utilizzare il servizio.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Descrizione del Servizio</h2>
              <p className="text-muted-foreground">
                GainFlow è un'applicazione web e mobile per la gestione finanziaria di progetti destinata a freelancer, imprenditori e piccole imprese. Il servizio permette di:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Creare e gestire progetti con tracciamento di entrate e uscite</li>
                <li>Importare transazioni da file CSV bancari</li>
                <li>Generare report PDF mensili</li>
                <li>Impostare budget per categoria</li>
                <li>Confrontare le performance tra progetti</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. Account Utente</h2>
              <p className="text-muted-foreground">
                Per utilizzare GainFlow è necessario creare un account con un indirizzo email valido. L'utente è responsabile della sicurezza delle proprie credenziali e di tutte le attività svolte con il proprio account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Piani e Pagamenti</h2>
              <p className="text-muted-foreground">GainFlow offre i seguenti piani:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Free:</strong> fino a 2 progetti, funzionalità base</li>
                <li><strong>Pro:</strong> fino a 10 progetti, funzionalità avanzate (€9,99/mese o €79/anno)</li>
                <li><strong>Business:</strong> progetti illimitati, accesso team (€19,99/mese o €149/anno)</li>
                <li><strong>Lifetime:</strong> tutte le funzionalità Pro per sempre (€249 una tantum)</li>
              </ul>
              <p className="text-muted-foreground">
                I pagamenti sono elaborati da Stripe Inc. Gli abbonamenti si rinnovano automaticamente. È possibile annullare in qualsiasi momento dalla sezione Abbonamento.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Rimborsi</h2>
              <p className="text-muted-foreground">
                Gli abbonamenti possono essere annullati in qualsiasi momento. L'accesso Premium rimane attivo fino alla fine del periodo di fatturazione. Non sono previsti rimborsi per periodi parziali, salvo quanto previsto dalla legge applicabile.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Uso Accettabile</h2>
              <p className="text-muted-foreground">L'utente si impegna a non:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Utilizzare il servizio per scopi illegali</li>
                <li>Tentare di accedere ai dati di altri utenti</li>
                <li>Interferire con il funzionamento del servizio</li>
                <li>Utilizzare strumenti automatizzati per abusare del sistema di referral</li>
                <li>Rivendere l'accesso al servizio senza autorizzazione</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Proprietà Intellettuale</h2>
              <p className="text-muted-foreground">
                GainFlow e tutti i suoi contenuti, funzionalità e design sono di proprietà di Ascanio Vecchio. L'utente mantiene la proprietà di tutti i dati che inserisce nell'applicazione.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Limitazione di Responsabilità</h2>
              <p className="text-muted-foreground">
                GainFlow è fornito "così com'è". Non garantiamo che il servizio sia privo di errori o interruzioni. Non siamo responsabili per decisioni finanziarie prese sulla base dei dati visualizzati nell'app. GainFlow non è un software di contabilità certificato e non sostituisce un commercialista.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Cancellazione dell'Account</h2>
              <p className="text-muted-foreground">
                L'utente può eliminare il proprio account in qualsiasi momento dalle Impostazioni. La cancellazione comporta l'eliminazione definitiva di tutti i dati entro 30 giorni. Gli abbonamenti attivi verranno annullati.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Modifiche ai Termini</h2>
              <p className="text-muted-foreground">
                Ci riserviamo il diritto di modificare questi termini. Le modifiche sostanziali saranno comunicate via email o tramite notifica nell'app. L'uso continuato del servizio dopo le modifiche costituisce accettazione.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Legge Applicabile</h2>
              <p className="text-muted-foreground">
                I presenti termini sono regolati dalla legge italiana. Per qualsiasi controversia è competente il Foro del luogo di residenza del consumatore, ai sensi del Codice del Consumo (D.Lgs. 206/2005).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">12. Contatti</h2>
              <p className="text-muted-foreground">
                Per domande sui Termini di Servizio: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none space-y-6">
            <section>
              <h2 className="text-xl font-semibold">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By using GainFlow, you agree to these Terms of Service in full. If you do not agree, please do not use the service.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">2. Service Description</h2>
              <p className="text-muted-foreground">
                GainFlow is a web and mobile application for project-based financial management designed for freelancers, entrepreneurs, and small businesses. The service allows you to:
              </p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Create and manage projects with income and expense tracking</li>
                <li>Import transactions from bank CSV files</li>
                <li>Generate monthly PDF reports</li>
                <li>Set budgets by category</li>
                <li>Compare performance across projects</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">3. User Account</h2>
              <p className="text-muted-foreground">
                To use GainFlow, you must create an account with a valid email address. You are responsible for the security of your credentials and all activity under your account.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">4. Plans and Payments</h2>
              <p className="text-muted-foreground">GainFlow offers the following plans:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li><strong>Free:</strong> up to 2 projects, basic features</li>
                <li><strong>Pro:</strong> up to 10 projects, advanced features (€9.99/month or €79/year)</li>
                <li><strong>Business:</strong> unlimited projects, team access (€19.99/month or €149/year)</li>
                <li><strong>Lifetime:</strong> all Pro features forever (€249 one-time)</li>
              </ul>
              <p className="text-muted-foreground">
                Payments are processed by Stripe Inc. Subscriptions renew automatically. You can cancel at any time from the Subscription section.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">5. Refunds</h2>
              <p className="text-muted-foreground">
                Subscriptions can be canceled at any time. Premium access remains active until the end of the billing period. No refunds are provided for partial periods, except as required by applicable law.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">6. Acceptable Use</h2>
              <p className="text-muted-foreground">You agree not to:</p>
              <ul className="list-disc pl-6 text-muted-foreground space-y-1">
                <li>Use the service for illegal purposes</li>
                <li>Attempt to access other users' data</li>
                <li>Interfere with the service's operation</li>
                <li>Use automated tools to abuse the referral system</li>
                <li>Resell access to the service without authorization</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold">7. Intellectual Property</h2>
              <p className="text-muted-foreground">
                GainFlow and all its content, features, and design are owned by Ascanio Vecchio. You retain ownership of all data you enter into the application.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">8. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                GainFlow is provided "as is." We do not guarantee that the service will be error-free or uninterrupted. We are not responsible for financial decisions made based on data displayed in the app. GainFlow is not certified accounting software and does not replace a professional accountant.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">9. Account Deletion</h2>
              <p className="text-muted-foreground">
                You can delete your account at any time from Settings. Deletion results in permanent removal of all data within 30 days. Active subscriptions will be canceled.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">10. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify these terms. Material changes will be communicated via email or in-app notification. Continued use after changes constitutes acceptance.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">11. Governing Law</h2>
              <p className="text-muted-foreground">
                These terms are governed by Italian law. Any disputes shall be subject to the jurisdiction of the consumer's place of residence, pursuant to the Italian Consumer Code (D.Lgs. 206/2005).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold">12. Contact</h2>
              <p className="text-muted-foreground">
                For questions about the Terms of Service: <a href="mailto:gainflow10@gmail.com" className="text-primary hover:underline">gainflow10@gmail.com</a>
              </p>
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
