import { TrashIcon } from "@primer/octicons-react";
import { ActionList, ActionMenu, Button, Text, TextInput } from "@primer/react";
import React, { useState } from "react";
import { Cookie, Tab } from "../../types";
import { ClipboardButton } from "../ClipboardButton";
import styles from "./CookieItem.module.scss";

type Props = {
  cookie: Cookie;
  onApply: (targetTab: Tab) => void;
  onDelete: () => void;
  onUpdate: (cookie: Cookie, newValue: string) => void;
};

export const CookieItem = ({ cookie, onApply, onDelete, onUpdate }: Props) => {
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [value, setValue] = useState(cookie.value);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log("editing cookie", cookie);
    const newValue = e.target.value;
    setValue(newValue);
    onUpdate(cookie, newValue);
  };

  const handleApplyClick = () => {
    chrome.tabs.query({}, (allTabs) => {
      setTabs(allTabs.filter((tab) => tab.url && tab.id));
    });
  };

  const handleTabSelect = (tab: Tab) => {
    onApply(tab);
    setTabs([]);
  };

  return (
    <div className={styles.container}>
      <Text as="p" className={styles.cookieName}>
        {cookie.name}
      </Text>
      <div className={styles.contentSection}>
        <TextInput
          value={value}
          onChange={handleValueChange}
          aria-label="Cookie value"
          block
          className={styles.valueInput}
        />
        <div className={styles.actionsSection}>
          <ClipboardButton value={value} />
          <ActionMenu>
            <ActionMenu.Button onClick={handleApplyClick}>
              Apply to Tab
            </ActionMenu.Button>
            <ActionMenu.Overlay width="medium">
              <div className={styles.tabsList}>
                <ActionList>
                  {tabs.map((tab) => (
                    <ActionList.Item
                      key={tab.id}
                      onSelect={() => handleTabSelect(tab)}
                      className={`${styles.tabItem} ${
                        tab.active ? styles.activeTab : ""
                      }`}
                    >
                      {tab.title || "Untitled"}
                    </ActionList.Item>
                  ))}
                </ActionList>
              </div>
            </ActionMenu.Overlay>
          </ActionMenu>
          <div className={styles.deleteButton}>
            <Button variant="danger" onClick={onDelete}>
              <TrashIcon />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
