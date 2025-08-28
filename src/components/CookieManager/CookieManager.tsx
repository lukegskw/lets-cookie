import { Text } from "@primer/react";
import React, { useState } from "react";
import { Cookie, Tab } from "../../types";
import { CookieItem } from "../CookieItem/CookieItem";
import styles from "./CookieManager.module.scss";

export const CookieManager = () => {
  const [cookies, setCookies] = useState<Cookie[]>([]);
  const [currentUrl, setCurrentUrl] = useState<string>("");
  const [error, setError] = useState<string>("");

  const loadCookies = () => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const tab = tabs[0];
      if (tab?.url) {
        setCurrentUrl(tab.url);
        const url = new URL(tab.url);
        chrome.cookies.getAll({ domain: url.hostname }, (cookies) => {
          if (chrome.runtime.lastError) {
            setError(
              chrome.runtime.lastError.message || "Unknown error occurred"
            );
          } else {
            setCookies(cookies);
          }
        });
      } else {
        setError("No active tab found or URL is undefined");
      }
    });
  };

  React.useEffect(() => {
    loadCookies();
  }, []);

  const handleApplyCookie = async (cookie: Cookie, targetTab: Tab) => {
    if (!targetTab.id || !targetTab.url) return;

    try {
      const targetUrl = new URL(targetTab.url);
      const newCookie: chrome.cookies.SetDetails = {
        url: targetUrl.toString(),
        name: cookie.name,
        value: cookie.value,
        domain: targetUrl.hostname,
        path: "/",
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
      };

      await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(
          {
            type: "APPLY_AND_REFRESH",
            cookie: newCookie,
            tabId: targetTab.id,
          },
          (response) => {
            if (response.success) {
              resolve(response);
            } else {
              reject(response.error);
            }
          }
        );
      });

      await chrome.tabs.update(targetTab.id, { active: true });
    } catch (err) {
      console.error("Error applying cookie:", err);
      setError(err instanceof Error ? err.message : "Failed to apply cookie");
    }
  };

  const handleDeleteCookie = async (cookie: Cookie) => {
    if (!currentUrl) return;

    try {
      const url = new URL(currentUrl);
      await chrome.cookies.remove({
        url: url.toString(),
        name: cookie.name,
      });
      loadCookies();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete cookie");
    }
  };

  const handleUpdateCookie = async (cookie: Cookie, newValue: string) => {
    if (!currentUrl) return;

    try {
      const url = new URL(currentUrl);

      await chrome.cookies.remove({
        url: url.toString(),
        name: cookie.name,
        storeId: cookie.storeId,
      });

      await chrome.cookies.set({
        url: url.toString(),
        name: cookie.name,
        value: newValue,
        domain: cookie.domain,
        path: cookie.path,
        secure: cookie.secure,
        httpOnly: cookie.httpOnly,
        sameSite: cookie.sameSite,
        expirationDate: cookie.expirationDate,
        storeId: cookie.storeId,
      });

      setCookies((prevCookies) =>
        prevCookies.map((c) =>
          c.name === cookie.name &&
          c.domain === cookie.domain &&
          c.path === cookie.path &&
          c.secure === cookie.secure &&
          c.httpOnly === cookie.httpOnly
            ? { ...c, value: newValue }
            : c
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update cookie");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <Text as="h1" className={styles.title}>
          Let's Cookie!
        </Text>
        <Text as="h3" className={styles.subtitle}>
          {currentUrl ? `${new URL(currentUrl).hostname}` : ""}
        </Text>
        {error && (
          <Text as="p" className={styles.error}>
            {error}
          </Text>
        )}
        {cookies.length === 0 ? (
          <Text as="p" className={styles.noCookies}>
            No cookies found for this domain
          </Text>
        ) : (
          <div>
            {cookies.map((cookie) => (
              <CookieItem
                key={`${cookie.name}-${cookie.domain}-${cookie.path}-${cookie.secure}-${cookie.httpOnly}`}
                cookie={cookie}
                onApply={(tab) => handleApplyCookie(cookie, tab)}
                onDelete={() => handleDeleteCookie(cookie)}
                onUpdate={handleUpdateCookie}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
