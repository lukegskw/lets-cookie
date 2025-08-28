import { CheckIcon, CopyIcon } from "@primer/octicons-react";
import { Button } from "@primer/react";
import React, { useState } from "react";
import styles from "./ClipboardButton.module.scss";

type Props = {
  value: string;
};

export const ClipboardButton: React.FC<Props> = ({ value }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value);
      setIsCopied(true);
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  return (
    <Button
      variant="invisible"
      onClick={handleCopy}
      aria-label={isCopied ? "Copied!" : "Copy cookie value"}
      className={styles.copyButton}
    >
      {isCopied ? <CheckIcon className={styles.copiedIcon} /> : <CopyIcon />}
    </Button>
  );
};
