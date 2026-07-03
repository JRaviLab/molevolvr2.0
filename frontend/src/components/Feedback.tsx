import { useLocation } from "react-router";
import { Fragment } from "react/jsx-runtime";
import { useLocalStorage } from "@reactuses/core";
import { useMutation } from "@tanstack/react-query";
import { mapValues, startCase, truncate } from "lodash";
import { Download, MessageCircleMore, Send } from "lucide-react";
import { createIssue } from "@/api/issue";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Form from "@/components/Form";
import Help from "@/components/Help";
import Link from "@/components/Link";
import TextBox from "@/components/TextBox";
import Tooltip from "@/components/Tooltip";
import { userAgent } from "@/util/browser";
import { downloadJpg } from "@/util/download";
import { shortenUrl } from "@/util/string";

const { VITE_EMAIL, VITE_ISSUES, VITE_ORG, VITE_REPO_NAME } = import.meta.env;

/** feedback form on every page. singleton. */
export default function Feedback() {
  /** form state, saved to local storage */
  let [name, setName] = useLocalStorage("feedback-name", "");
  let [username, setUsername] = useLocalStorage("feedback-username", "");
  let [email, setEmail] = useLocalStorage("feedback-email", "");
  let [subject, setSubject] = useLocalStorage("feedback-subject", "");
  let [feedback, setFeedback] = useLocalStorage("feedback-body", "");

  /** set fallbacks */
  name ||= "";
  username ||= "";
  email ||= "";
  subject ||= "";
  feedback ||= "";

  const { pathname, search, hash } = useLocation();
  const { browser, engine, os, device, cpu } = userAgent;

  /** validate username */
  if (username && username.length > 0)
    username = username.replaceAll(/^@*/g, "@");

  /** extra details to include in report */
  const details = mapValues(
    {
      Page: [pathname + search + hash],
      Browser: [browser.name, browser.version],
      Engine: [engine.name, engine.version],
      OS: [os.name, os.version],
      Device: [device.type, device.model, device.vendor],
      CPU: [cpu.architecture],
    },
    (value) => value.filter(Boolean).join(" "),
  );

  /** feedback title */
  const title = truncate(
    [name.trim() || username.trim(), subject.trim() || feedback.trim()]
      .filter(Boolean)
      .join(" | "),
    { length: 100 },
  );

  /** feedback body */
  const body = [{ name, username, email }, details, { feedback }]
    .map((group) =>
      Object.entries(group)
        .map(([key, value]) => [
          `**${startCase(key)}**`,
          value.trim() ? value.trim() : "\\-",
        ])
        .flat()
        .join("\n"),
    )
    .join("\n\n");

  /** submit feedback action */
  const { mutate, data, status, reset } = useMutation({
    mutationKey: ["feedback"],
    mutationFn: (params: Parameters<typeof createIssue>) =>
      createIssue(...params),
    retry: 3,
    retryDelay: (retry) => 2 * retry * 1000,
  });

  /** submit feedback */
  const onSubmit = async () =>
    mutate([
      {
        owner: VITE_ORG,
        repo: VITE_REPO_NAME,
        title,
        body,
        labels: ["feedback"],
      },
    ]);

  return (
    <Form onSubmit={onSubmit}>
      <Dialog
        title="Feedback"
        onChange={(open) => {
          if (open && (status === "success" || status === "error")) {
            if (status === "success") {
              setSubject(null);
              setFeedback(null);
            }
            reset();
          }
        }}
        content={() => (
          <>
            <div className="grid-layout">
              <TextBox
                className="flex-col"
                label="Name"
                placeholder="Your Name"
                tooltip="Optional. So we know who you are."
                value={name}
                onChange={setName}
              />
              <TextBox
                className="flex-col"
                label="GitHub Username"
                placeholder="@yourname"
                tooltip="Optional. So we can tag you in the post and you can follow it."
                value={username}
                onChange={setUsername}
              />
              <TextBox
                className="flex-col"
                label="Email"
                placeholder="your.name@email.com"
                tooltip="Optional. So we can contact you directly if needed."
                value={email}
                onChange={setEmail}
              />
            </div>
            <TextBox
              className="flex-col"
              label="Subject"
              placeholder="Subject"
              required
              value={subject}
              onChange={setSubject}
            />
            <TextBox
              className="flex-col"
              label="Feedback"
              placeholder="Questions, suggestions, bugs, etc."
              required
              multi
              rows={5}
              value={feedback}
              onChange={setFeedback}
            />

            <Alert
              type={
                status === "pending"
                  ? "loading"
                  : status === "error"
                    ? "error"
                    : status === "success"
                      ? "success"
                      : "info"
              }
            >
              {status === "idle" && (
                <>
                  Submitting will start a <strong>public post</strong> on{" "}
                  <Link to={VITE_ISSUES}>our feedback tracker</Link> with{" "}
                  <strong>all of the above</strong> and{" "}
                  <Tooltip
                    content={
                      <dl>
                        {Object.entries(details).map(([key, value]) => (
                          <Fragment key={key}>
                            <dt>{key}</dt>
                            <dd>{value}</dd>
                          </Fragment>
                        ))}
                      </dl>
                    }
                  >
                    <span className="text-tooltip" tabIndex={0} role="button">
                      some debug info
                    </span>
                  </Tooltip>
                  . You'll get a link to it once it's created.
                </>
              )}
              {status === "pending" && "Submitting feedback"}
              {status === "error" && (
                <>
                  Error submitting feedback. Contact us directly:{" "}
                  <Link
                    to={`mailto:${VITE_EMAIL}?body=${window.encodeURIComponent(body)}`}
                  >
                    {VITE_EMAIL}
                  </Link>
                  .
                </>
              )}
              {status === "success" && data.link && (
                <>
                  Submitted feedback!{" "}
                  <Link to={data.link}>{shortenUrl(data.link)}</Link>
                </>
              )}
            </Alert>
          </>
        )}
        bottomContent={
          <>
            <div className="flex flex-wrap gap-2">
              <Button
                tooltip="Download a screenshot of the current page"
                onClick={async () => {
                  close();
                  await downloadJpg(document.body, ["screenshot"]);
                  open();
                }}
              >
                <Download />
                Screenshot
              </Button>
              <Help
                tooltip={
                  <div>
                    This can help us troubleshoot issues. Currently, we can't{" "}
                    <i>automatically</i> attach a screenshot with your feedback,
                    so you'll have to download and attach/send it manually.
                  </div>
                }
              />
            </div>

            <div className="grow" />

            {status === "idle" && (
              <Button design="accent" type="submit">
                <Send />
                Submit
              </Button>
            )}
          </>
        }
      >
        <Button design="accent" tooltip="Give us feedback">
          <MessageCircleMore />
        </Button>
      </Dialog>
    </Form>
  );
}
