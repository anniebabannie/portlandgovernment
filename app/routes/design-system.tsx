import type { Route } from "./+types/design-system";
import {
  Button,
  Checkbox,
  Input,
  Radio,
  Select,
  Textarea,
} from "../components/ui";

export function meta({}: Route.MetaArgs) {
  return [{ title: "Design System — Portland Government" }];
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-ink/15 py-10">
      <h2 className="mb-5 text-xs font-semibold uppercase tracking-[0.18em] text-ink/60">
        {title}
      </h2>
      {children}
    </section>
  );
}

function Label({ htmlFor, children }: { htmlFor: string; children: string }) {
  return (
    <label htmlFor={htmlFor} className="mb-2 block text-sm font-medium">
      {children}
    </label>
  );
}

export default function DesignSystem() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16">
      <h1 className="text-3xl font-bold tracking-tight">Design System</h1>
      <p className="mt-2 text-sm text-ink/60">
        Black and white. Two tokens: <code>ink</code> and <code>paper</code>.
      </p>

      <Section title="Buttons">
        <div className="flex flex-wrap items-center gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button disabled>Disabled</Button>
          <Button variant="secondary" disabled>
            Disabled
          </Button>
        </div>
      </Section>

      <Section title="Text input">
        <div className="space-y-5">
          <div>
            <Label htmlFor="ds-name">Full name</Label>
            <Input id="ds-name" placeholder="Jane Doe" />
          </div>
          <div>
            <Label htmlFor="ds-disabled">Disabled</Label>
            <Input id="ds-disabled" placeholder="Not editable" disabled />
          </div>
        </div>
      </Section>

      <Section title="Textarea">
        <Label htmlFor="ds-notes">Notes</Label>
        <Textarea id="ds-notes" placeholder="Tell us more…" />
      </Section>

      <Section title="Select">
        <Label htmlFor="ds-dept">Department</Label>
        <Select id="ds-dept" defaultValue="">
          <option value="" disabled>
            Choose a department
          </option>
          <option value="parks">Parks &amp; Recreation</option>
          <option value="transport">Transportation</option>
          <option value="water">Water Bureau</option>
        </Select>
      </Section>

      <Section title="Checkboxes">
        <div className="flex flex-col gap-3">
          <Checkbox label="Email me updates" defaultChecked />
          <Checkbox label="Send a printed copy" />
          <Checkbox label="Unavailable option" disabled />
        </div>
      </Section>

      <Section title="Radio buttons">
        <div className="flex flex-col gap-3">
          <Radio name="ds-contact" label="Contact by email" defaultChecked />
          <Radio name="ds-contact" label="Contact by phone" />
          <Radio name="ds-contact" label="Contact by mail" disabled />
        </div>
      </Section>
    </main>
  );
}
