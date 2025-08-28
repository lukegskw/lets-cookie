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
  const [hoveredTabId, setHoveredTabId] = useState<number | null>(null);

  const handleValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  const changeFavicon = async (
    tabId: number,
    iconType: "highlight" | "restore"
  ) => {
    try {
      const faviconDataUrl =
        iconType === "highlight" ? chrome.runtime.getURL("icon16.png") : null;

      await chrome.scripting.executeScript({
        target: { tabId },
        func: (dataUrl: string | null) => {
          const existingFavicon = document.querySelector(
            'link[rel*="icon"]'
          ) as HTMLLinkElement;

          if (dataUrl) {
            // Store original favicon
            if (existingFavicon && !existingFavicon.dataset.original) {
              existingFavicon.dataset.original = existingFavicon.href;
            }

            // Change to highlight icon
            if (existingFavicon) {
              existingFavicon.href = dataUrl;
            } else {
              const link = document.createElement("link");
              link.rel = "icon";
              link.href = dataUrl;
              document.head.appendChild(link);
            }
          } else {
            // Restore original favicon
            if (existingFavicon && existingFavicon.dataset.original) {
              existingFavicon.href = existingFavicon.dataset.original;
              delete existingFavicon.dataset.original;
            }
          }
        },
        args: [faviconDataUrl],
      });
    } catch (err) {
      console.error("Error changing favicon:", err);
    }
  };

  const handleTabHover = (tab: Tab) => {
    if (tab.id) {
      setHoveredTabId(tab.id);
      changeFavicon(tab.id, "highlight");
    }
  };

  const handleTabLeave = () => {
    if (hoveredTabId) {
      changeFavicon(hoveredTabId, "restore");
      setHoveredTabId(null);
    }
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
                      onMouseEnter={() => handleTabHover(tab)}
                      onMouseLeave={handleTabLeave}
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
