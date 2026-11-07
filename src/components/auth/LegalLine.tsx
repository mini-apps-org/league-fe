import { Trans } from 'react-i18next';
import { Link } from 'react-router-dom';

// One sentence in one i18n key, with the two links as placeholders, so a translator can move
// them. Composing it from three fragments would fix English word order into every locale.
export default function LegalLine() {
  return (
    <p className="text-center text-xs text-muted-foreground">
      <Trans
        i18nKey="auth.legal"
        components={{
          rules: <Link to="/rules" className="underline underline-offset-2" />,
          privacy: <Link to="/privacy" className="underline underline-offset-2" />,
        }}
      />
    </p>
  );
}
