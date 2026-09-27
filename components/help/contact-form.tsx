"use client";

import { useState, type FormEvent } from "react";
import { CheckCircle2, Send } from "lucide-react";
import { Field, TextArea, TextInput } from "@/components/forms/fields";
import { FormSelect } from "@/components/forms/form-select";

const TOPICS = [
  { value: "account", label: "My account or sign in" },
  { value: "ad", label: "An ad or my listings" },
  { value: "order", label: "An order or delivery" },
  { value: "shop", label: "Opening or verifying a shop" },
  { value: "business", label: "Partnership or advertising" },
  { value: "other", label: "Something else" },
];

export function ContactForm({ defaultName = "" }: { defaultName?: string }) {
  const [name, setName] = useState(defaultName);
  const [reach, setReach] = useState("");
  const [topic, setTopic] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState<Record<string, string>>({});
  const [sent, setSent] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (name.trim().length < 2) next.name = "Enter your name.";
    if (reach.trim().length < 6) next.reach = "Add a phone number or email so we can reply.";
    if (!topic) next.topic = "Choose a topic.";
    if (msg.trim().length < 10) next.msg = "Tell us a little more.";
    setErr(next);
    if (!Object.keys(next).length) setSent(true);
  };

  if (sent) {
    return (
      <div className="rounded-2xl border border-line p-8 text-center" role="status">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden />
        <h2 className="mt-3 text-[22px] font-bold text-ink">Message received</h2>
        <p className="mt-2 text-[14.5px] text-muted">Thanks, {name.split(" ")[0]}. We reply within one working day, usually much sooner.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5 rounded-2xl border border-line p-5 md:p-7">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Your name" htmlFor="ct-name" error={err.name}>
          <TextInput id="ct-name" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} invalid={Boolean(err.name)} />
        </Field>
        <Field label="Phone or email" htmlFor="ct-reach" error={err.reach}>
          <TextInput id="ct-reach" value={reach} onChange={(e) => setReach(e.target.value)} placeholder="0355 1234567" invalid={Boolean(err.reach)} />
        </Field>
      </div>
      <Field label="Topic" htmlFor="ct-topic" error={err.topic}>
        <FormSelect id="ct-topic" name="topic" label="Topic" options={TOPICS} value={topic} onChange={setTopic} placeholder="What is it about?" invalid={Boolean(err.topic)} />
      </Field>
      <Field label="Message" htmlFor="ct-msg" error={err.msg}>
        <TextArea id="ct-msg" rows={5} maxLength={1500} value={msg} onChange={(e) => setMsg(e.target.value)} invalid={Boolean(err.msg)} />
      </Field>
      <button type="submit" className="inline-flex h-12 items-center gap-2 rounded-full bg-mountain px-7 text-[15px] font-semibold text-white hover:bg-mountain-hover">
        <Send className="size-4" aria-hidden /> Send message
      </button>
    </form>
  );
}
