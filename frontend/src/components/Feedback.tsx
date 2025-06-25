import { FaDownload, FaRegComment, FaRegPaperPlane } from "react-icons/fa6";
import { useLocation } from "react-router";
import { Fragment } from "react/jsx-runtime";
import clsx from "clsx";
import { mapValues } from "lodash";
import { useLocalStorage } from "@reactuses/core";
import Alert from "@/components/Alert";
import Button from "@/components/Button";
import Dialog from "@/components/Dialog";
import Flex from "@/components/Flex";
import Link from "@/components/Link";
import TextBox from "@/components/TextBox";
import { userAgent } from "@/util/browser";
import { downloadJpg } from "@/util/download";
import classes from "./Feedback.module.css";

const Feedback = () => {
  const [name, setName] = useLocalStorage("feedback-name", "");
  const [username, setUsername] = useLocalStorage("feedback-username", "");
  const [email, setEmail] = useLocalStorage("feedback-email", "");
  const [feedback, setFeedback] = useLocalStorage("feedback-body", "");

  const { pathname, search, hash } = useLocation();
  const { browser, engine, os, device, cpu } = userAgent;

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

  return (
    <Dialog
      title="Feedback form"
      content={(close, open) => (
        <form className={classes.form}>
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
            placeholder="Comments, suggestions, bugs"
            required
            multi
            value={feedback || ""}
            onChange={setFeedback}
          />

          <div className={clsx("mini-table", classes.details, classes.full)}>
            {Object.entries(details).map(([key, value]) => (
              <Fragment key={key}>
                <div>{key}</div>
                <div>{value}</div>
              </Fragment>
            ))}
          </div>
          <Alert className={classes.full}>
            Submitting will start a <strong>public discussion</strong> on{" "}
            <Link to={import.meta.env.VITE_REPO + "/issues"}>our GitHub</Link>{" "}
            with <strong>all of the information above</strong>.
            <br />
            You'll get a link to it once it's created.
          </Alert>
          <Flex>
            <Button
              className={classes.middle}
              text="Submit"
              icon={<FaRegPaperPlane />}
              type="submit"
            />
            <Button
              text="Screenshot"
              icon={<FaDownload />}
              design="hollow"
              tooltip="Download a screenshot of the current page. Attach to your created discussion to help us debug."
              onClick={async () => {
                close();
                await downloadJpg(document.body, ["screenshot.jpg"]);
                open();
              }}
            />
          </Flex>
        </form>
      )}
    >
      <Button icon={<FaRegComment />} tooltip="Feedback form" />
    </Dialog>
  );
};

export default Feedback;
