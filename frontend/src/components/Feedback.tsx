import type { FormEvent } from "react";
import { FaDownload, FaRegComment, FaRegPaperPlane } from "react-icons/fa6";
import { useLocation } from "react-router";
import { Fragment } from "react/jsx-runtime";
import clsx from "clsx";
import { mapValues, startCase, truncate } from "lodash";
import { useLocalStorage } from "@reactuses/core";
import { useMutation } from "@tanstack/react-query";
import { submitFeedback } from "@/api/feedback";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Flex from "@/components/Flex";
import Help from "@/components/Help";
import Link from "@/components/Link";
import TextBox from "@/components/TextBox";
import { userAgent } from "@/util/browser";
import { downloadJpg } from "@/util/download";
import { shortenUrl } from "@/util/string";
import classes from "./Feedback.module.css";

const { VITE_EMAIL, VITE_ISSUES } = import.meta.env;

/** feedback form on every page. singleton. */
const Feedback = () => {
  /** form state, saved to local storage */
  const [name, setName] = useLocalStorage("feedback-name", "");
  let [username, setUsername] = useLocalStorage("feedback-username", "");
  const [email, setEmail] = useLocalStorage("feedback-email", "");
  const [feedback, setFeedback] = useLocalStorage("feedback-body", "");

  const { pathname, search, hash } = useLocation();
  const { browser, engine, os, device, cpu } = userAgent;

  /** validate username */
  if (username && username.length > 0)
    username = username.replaceAll(/^@*/g, "@") || "";

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

  /** issue title */
  const title = truncate(
    ["Feedback", name || username || "anon."].join(" - "),
    { length: 250 },
  );

  /** issue body */
  const body = [{ name, username, email }, details, { feedback }]
    .map((group) =>
      Object.entries(group)
        .map(([key, value]) => [`**${startCase(key)}**`, value || "-"])
        .flat()
        .join("\n"),
    )
    .join("\n\n");

  /** submit feedback action */
  const { mutate, data, isIdle, isPending, isError, isSuccess, reset } =
    useMutation({
      mutationKey: ["feedback"],
      mutationFn: (params: Parameters<typeof submitFeedback>) =>
        submitFeedback(...params),
    });

  /** on form submit */
  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();

    /** submit issue */
    mutate([title, body]);
  };

  return (
    <Dialog
      title="Feedback"
      onChange={(open) => {
        if (open && (isSuccess || isError)) {
          if (isSuccess) setFeedback(null);
          reset();
        }
      }}
      content={(close, open) => (
        <form className={classes.form} onSubmit={onSubmit}>
          <div className={classes.fields}>
            <TextBox
              label="Name"
              placeholder="Your Name"
              tooltip="Optional. So we know who you are."
              value={name || ""}
              onChange={setName}
            />
            <TextBox
              label="GitHub Username"
              placeholder="@yourname"
              tooltip="Optional. So we can tag you in the discussion and you can follow it."
              value={username || ""}
              onChange={setUsername}
            />
            <TextBox
              label="Email"
              placeholder="your.name@email.com"
              tooltip="Optional. So we can contact you directly if needed."
              value={email || ""}
              onChange={setEmail}
            />
          </div>

          <TextBox
            className="full"
            label="Feedback"
            placeholder="Questions, suggestions, bugs, etc."
            required
            multi
            value={feedback || ""}
            onChange={setFeedback}
          />

          <div className={clsx("mini-table", classes.details)}>
            {Object.entries(details).map(([key, value]) => (
              <Fragment key={key}>
                <div>{key}</div>
                <div>{value}</div>
              </Fragment>
            ))}
          </div>

          <Alert
            type={
              isPending
                ? "loading"
                : isError
                  ? "error"
                  : isSuccess
                    ? "success"
                    : "info"
            }
          >
            {isIdle && (
              <>
                Submitting will start a <strong>public discussion</strong> on{" "}
                <Link to={VITE_ISSUES}>our GitHub issue tracker</Link> with{" "}
                <strong>all of the information above</strong>. You'll get a link
                to it once it's created.
              </>
            )}
            {isPending && "Submitting feedback"}
            {isError && (
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
            {isSuccess && data.link && (
              <>
                Submitted feedback!{" "}
                <Link to={data.link}>{shortenUrl(data.link)}</Link>
              </>
            )}
          </Alert>

          <Flex gap="lg" gapRatio={0.5}>
            <Flex gap="sm">
              <Button
                text="Screenshot"
                icon={<FaDownload />}
                design="hollow"
                tooltip="Download a screenshot of the current page"
                onClick={async () => {
                  close();
                  await downloadJpg(document.body, ["screenshot.jpg"]);
                  open();
                }}
              />
              <Help
                tooltip={
                  <div>
                    A screenshot of the current page can help us troubleshoot
                    issues. Currently, we can't <i>automatically</i> attach a
                    screenshot with your feedback, so you'll have to download
                    and attach/send it manually.
                  </div>
                }
              />
            </Flex>

            {isIdle && (
              <Button
                className={classes.middle}
                text="Submit"
                icon={<FaRegPaperPlane />}
                type="submit"
              />
            )}
          </Flex>
        </form>
      )}
    >
      <Button icon={<FaRegComment />} tooltip="Give us feedback" />
    </Dialog>
  );
};

export default Feedback;
