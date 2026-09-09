
"use strict";

/*
  Primo Volo d'Italiano
  Mappa di Volo — City Unlock Journey

  This REPLACES the Passport UI as the motivational layer.
  It reuses Flight Path practice data and preserves previously
  earned Passport "explored" achievements during migration.

  Progress Report remains separate accuracy/performance evidence.
*/

(function initializeVoloCityJourney() {
  const storage = window.PrimoVoloStorage;

  if (!storage) {
    console.error(
      "Mappa di Volo could not start because PrimoVoloStorage was not found."
    );
    return;
  }

  const headerUtilities =
    document.querySelector(".header-utilities");

  const topicSelect =
    document.querySelector("#topicSelect");

  const topicSelectorSection =
    document.querySelector(
      ".topic-selector-section"
    );

  const activityMenu =
    document.querySelector(
      ".activity-menu"
    );

  if (
    !headerUtilities ||
    !topicSelect ||
    !topicSelectorSection ||
    !activityMenu
  ) {
    console.error("Mappa di Volo could not start.");
    return;
  }

  const JOURNEY_STORAGE_KEY =
    storage.keys.journey;

  const activityAvailability =
    window.PrimoVoloActivityAvailability;

  const OLD_PASSPORT_STORAGE_KEY =
    storage.keys.legacyPassport;

  const EXPLORED_RATIO = 0.70;

  /*
    The 10-city journey is intentionally explicit and stable.
    Two explored topics unlock each new city.
    Route is geographically readable across the underlay.
  */
  const CITY_STOPS = [
    { id:"genova", name:"Genova", regionId:"liguria", x:29.0, y:26.2, labelDx:-24, labelDy:22, unlockAt:2 },
    { id:"torino", name:"Torino", regionId:"piemonte", x:22.0, y:20.7, labelDx:-22, labelDy:18, unlockAt:4 },
    { id:"milano", name:"Milano", regionId:"lombardia", x:30.2, y:17.5, labelDx:18, labelDy:12, unlockAt:6 },
    { id:"venezia", name:"Venezia", regionId:"veneto", x:47.0, y:17.7, labelDx:34, labelDy:18, unlockAt:8 },
    { id:"firenze", name:"Firenze", regionId:"toscana", x:41.2, y:31.4, labelDx:22, labelDy:23, unlockAt:10 },
    { id:"roma", name:"Roma", regionId:"lazio", x:48.0, y:46.7, labelDx:-18, labelDy:22, unlockAt:12 },
    { id:"napoli", name:"Napoli", regionId:"campania", x:57.5, y:55.3, labelDx:-8, labelDy:25, unlockAt:14 },
    { id:"lecce", name:"Lecce", regionId:"puglia", x:74.5, y:59.4, labelDx:20, labelDy:20, unlockAt:16 },
    { id:"palermo", name:"Palermo", regionId:"sicilia", x:52.7, y:77.7, labelDx:-10, labelDy:22, unlockAt:18 },
    { id:"cagliari", name:"Cagliari", regionId:"sardegna", x:29.8, y:68.6, labelDx:-12, labelDy:22, unlockAt:20 }
  ];

  /*
    LOCAL PREVIEW MODE
    ------------------
    For visual testing only on localhost / 127.0.0.1.

    Example:
      index.html?journeyPreview=genova

    It never changes saved Journey data and is ignored on the
    published site.
  */
  const journeyPreview = (() => {
    const localHost =
      window.location.hostname === "127.0.0.1" ||
      window.location.hostname === "localhost";

    if (!localHost) {
      return null;
    }

    const requestedCityId =
      new URLSearchParams(
        window.location.search
      ).get("journeyPreview");

    if (!requestedCityId) {
      return null;
    }

    const city =
      CITY_STOPS.find(
        stop =>
          stop.id === requestedCityId
      );

    return city
      ? {
          cityId: city.id,
          exploredCount: city.unlockAt
        }
      : null;
  })();

  function journeyStorageKey() {
    return storage.studentKey(JOURNEY_STORAGE_KEY);
  }

  function oldPassportStorageKey() {
    return storage.studentKey(OLD_PASSPORT_STORAGE_KEY);
  }

  function emptyJourneyData() {
    return {
      version: 1,
      exploredTopics: {},
      celebratedCities: [],
      migratedPassport: false
    };
  }

  function loadJourneyData() {
    try {
      const saved =
        storage.getItem(
          journeyStorageKey()
        );

      if (!saved) {
        return emptyJourneyData();
      }

      const parsed = JSON.parse(saved);

      return {
        version: 1,
        exploredTopics:
          parsed &&
          typeof parsed.exploredTopics === "object"
            ? parsed.exploredTopics
            : {},
        celebratedCities:
          Array.isArray(parsed?.celebratedCities)
            ? parsed.celebratedCities
            : [],
        migratedPassport:
          Boolean(parsed?.migratedPassport)
      };
    } catch (error) {
      console.warn(
        "City journey data could not be loaded.",
        error
      );
      return emptyJourneyData();
    }
  }

  let journeyData = loadJourneyData();

  function saveJourneyData() {
    try {
      storage.setItem(
        journeyStorageKey(),
        JSON.stringify(journeyData)
      );
    } catch (error) {
      console.warn(
        "City journey data could not be saved.",
        error
      );
    }
  }

  function migrateOldPassportOnce() {
    if (journeyData.migratedPassport) {
      return;
    }

    try {
      const saved =
        storage.getItem(
          oldPassportStorageKey()
        );

      if (saved) {
        const oldData = JSON.parse(saved);
        const byTopic = oldData?.byTopic || {};

        Object.entries(byTopic)
          .forEach(([topicKey, achievement]) => {
            if (achievement?.explored) {
              journeyData.exploredTopics[topicKey] = {
                earnedAt:
                  achievement.earnedAt ||
                  new Date().toISOString(),
                source: "passport-migration"
              };
            }
          });
      }
    } catch (error) {
      console.warn(
        "Old Passport achievements could not be migrated.",
        error
      );
    }

    journeyData.migratedPassport = true;
    saveJourneyData();
  }

  function topicList() {
    return [...topicSelect.options]
      .filter(option => Boolean(option.value))
      .map(option => option.value);
  }

  function topicPracticeStatus(topicKey) {
    const flightData =
      typeof window.getVoloFlightPathData === "function"
        ? window.getVoloFlightPathData()
        : null;

    const topicData =
      flightData?.byTopic?.[topicKey];

    const storedAvailable = [
      ...new Set(
        Array.isArray(topicData?.available)
          ? topicData.available
          : []
      )
    ].filter(
      mode =>
        mode &&
        mode !== "sentences"
    );

    const canonicalAvailable =
      activityAvailability
        ?.getCanonicalModes(
          topicKey
        ) || [];

    const hasCanonicalResolver =
      Boolean(activityAvailability);

    /*
      Never award a new explored topic from a stale DOM snapshot.
      Stored availability remains only as a compatibility fallback.
    */
    const available =
      hasCanonicalResolver
        ? canonicalAvailable
        : storedAvailable;

    const practiced = new Set(
      Array.isArray(topicData?.practiced)
        ? topicData.practiced
        : []
    );

    const practicedAvailable =
      available.filter(
        mode => practiced.has(mode)
      );

    const minimumForSmallSet =
      Math.min(
        4,
        available.length
      );

    const required =
      available.length
        ? Math.max(
            minimumForSmallSet,
            Math.ceil(
              available.length *
              EXPLORED_RATIO
            )
          )
        : 0;

    return {
      availableCount: available.length,
      practicedCount:
        practicedAvailable.length,
      required,
      qualifies:
        required > 0 &&
        practicedAvailable.length >= required
    };
  }

  function syncExploredTopics() {
    migrateOldPassportOnce();

    let changed = false;

    topicList().forEach(topicKey => {
      if (
        journeyData.exploredTopics[
          topicKey
        ]
      ) {
        return;
      }

      const status =
        topicPracticeStatus(topicKey);

      if (!status.qualifies) {
        return;
      }

      journeyData.exploredTopics[
        topicKey
      ] = {
        earnedAt:
          new Date().toISOString(),
        practicedCount:
          status.practicedCount,
        availableCount:
          status.availableCount,
        requiredAtAward:
          status.required,
        source: "flight-path"
      };

      changed = true;
    });

    if (changed) {
      saveJourneyData();
    }

    return changed;
  }

  function exploredCount() {
    return Object.keys(
      journeyData.exploredTopics
    ).length;
  }

  function effectiveExploredCount() {
    const realCount =
      exploredCount();

    return journeyPreview
      ? Math.max(
          realCount,
          journeyPreview.exploredCount
        )
      : realCount;
  }

  function unlockedCities() {
    const count =
      effectiveExploredCount();

    return CITY_STOPS.filter(
      city =>
        count >= city.unlockAt
    );
  }

  /* ========================================
     HOME-SCREEN ITALY JOURNEY CARD
     ======================================== */

  const journeyCard =
    document.createElement(
      "section"
    );

  journeyCard.id =
    "voloItalyJourneyCard";

  journeyCard.className =
    "volo-journey-home-card";

  journeyCard.setAttribute(
    "aria-labelledby",
    "voloJourneyHomeTitle"
  );

  journeyCard.innerHTML = `
    <div
      class="volo-journey-home-reward-art"
      aria-hidden="true"
    >
      <img
        id="voloJourneyHomeRewardImage"
        alt=""
      >
      <span
        id="voloJourneyHomeRewardLock"
        class="volo-journey-home-reward-lock"
      >🔒</span>
    </div>

    <div class="volo-journey-home-reward-copy">
      <span class="volo-journey-home-reward-eyebrow">
        🎁 La tua prossima città
        <span lang="en">· Your next city</span>
      </span>

      <div class="volo-journey-home-next-row">
        <strong
          id="voloJourneyHomeNext"
          class="volo-journey-home-next"
        ></strong>

        <button
          type="button"
          id="voloJourneyHomeNextAudio"
          class="pv-audio-button pv-audio-small"
          aria-label="Ascolta la prossima città"
          title="Ascolta la prossima città"
        >🔊</button>
      </div>

      <span
        id="voloJourneyHomeRewardHint"
        class="volo-journey-home-reward-hint"
      ></span>

      <div
        class="volo-journey-home-reward-track"
        aria-hidden="true"
      >
        <span
          id="voloJourneyHomeRewardProgress"
        ></span>
      </div>

      <span
        id="voloJourneyHomeRewardCount"
        class="volo-journey-home-reward-count"
      ></span>
    </div>

    <button
      type="button"
      id="voloJourneyCardButton"
      class="volo-journey-home-button"
      aria-haspopup="dialog"
      aria-controls="voloCityMapModal"
    >
      Vedi la mappa
      <span lang="en">See Map</span>
      <span aria-hidden="true">→</span>
    </button>
  `;

  activityMenu
    .insertAdjacentElement(
      "afterend",
      journeyCard
    );

  const journeyCardButton =
    journeyCard.querySelector(
      "#voloJourneyCardButton"
    );

  const journeyHomeNext =
    journeyCard.querySelector(
      "#voloJourneyHomeNext"
    );

  const journeyHomeNextAudio =
    journeyCard.querySelector(
      "#voloJourneyHomeNextAudio"
    );

  const journeyHomeRewardImage =
    journeyCard.querySelector(
      "#voloJourneyHomeRewardImage"
    );

  const journeyHomeRewardLock =
    journeyCard.querySelector(
      "#voloJourneyHomeRewardLock"
    );

  const journeyHomeRewardHint =
    journeyCard.querySelector(
      "#voloJourneyHomeRewardHint"
    );

  const journeyHomeRewardProgress =
    journeyCard.querySelector(
      "#voloJourneyHomeRewardProgress"
    );

  const journeyHomeRewardCount =
    journeyCard.querySelector(
      "#voloJourneyHomeRewardCount"
    );

  function cityArtworkPath(city) {
    return (
      "images/progress/italy-journey/cities/" +
      city.id +
      ".png"
    );
  }

  function renderJourneyCard() {
    syncExploredTopics();

    const count =
      effectiveExploredCount();

    const unlocked =
      unlockedCities();


    const nextCity =
      CITY_STOPS.find(
        city => count < city.unlockAt
      );

    if (!nextCity) {
      journeyHomeNext.textContent =
        "🎉 Viaggio completato!";

      journeyHomeRewardHint.textContent =
        "Hai sbloccato tutte le città! · You unlocked every city!";

      journeyHomeRewardProgress.style.width =
        "100%";

      journeyHomeRewardCount.textContent =
        `${CITY_STOPS.length} / ${CITY_STOPS.length} città · cities`;

      journeyHomeRewardImage.hidden = true;
      journeyHomeRewardLock.textContent = "🏆";

      journeyHomeNextAudio.hidden = true;
      journeyHomeNextAudio.removeAttribute("data-speak-it");
      return;
    }

    journeyHomeNextAudio.hidden = false;
    journeyHomeNextAudio.dataset.speakIt =
      nextCity.name;

    const remaining =
      nextCity.unlockAt - count;

    const cityIndex =
      CITY_STOPS.indexOf(nextCity);

    const previousUnlockAt =
      cityIndex > 0
        ? CITY_STOPS[cityIndex - 1].unlockAt
        : 0;

    const neededForCity =
      nextCity.unlockAt -
      previousUnlockAt;

    const doneTowardCity =
      Math.max(
        0,
        Math.min(
          neededForCity,
          count - previousUnlockAt
        )
      );

    const progressPercent =
      neededForCity
        ? (
            doneTowardCity /
            neededForCity
          ) * 100
        : 0;

    journeyHomeNext.textContent =
      nextCity.name;

    journeyHomeRewardHint.textContent =
      remaining === 1
        ? "Esplora ancora 1 argomento per sbloccarla! · Explore 1 more topic to unlock it!"
        : `Esplora ancora ${remaining} argomenti per sbloccarla! · Explore ${remaining} more topics to unlock it!`;

    journeyHomeRewardProgress.style.width =
      `${progressPercent}%`;

    journeyHomeRewardCount.textContent =
      `${doneTowardCity} / ${neededForCity} verso ${nextCity.name} · toward ${nextCity.name}`;

    journeyHomeRewardImage.hidden = false;
    journeyHomeRewardImage.src =
      cityArtworkPath(nextCity);
    journeyHomeRewardImage.alt = "";

    journeyHomeRewardLock.textContent =
      "🔒";
  }

  /* ========================================
     BUTTON
     ======================================== */

  let mapButton =
    document.querySelector(
      "#voloCityMapButton"
    );

  if (!mapButton) {
    mapButton =
      document.createElement(
        "button"
      );

    mapButton.type = "button";
    mapButton.id = "voloCityMapButton";
    mapButton.className = "header-link";
    mapButton.setAttribute(
      "aria-haspopup",
      "dialog"
    );
    mapButton.setAttribute(
      "aria-controls",
      "voloCityMapModal"
    );
    mapButton.innerHTML =
      "🗺️ Viaggio in Italia";

    const progressButton =
      document.querySelector(
        "#progressButton"
      );

    if (progressButton) {
      progressButton.insertAdjacentElement(
        "afterend",
        mapButton
      );
    } else {
      headerUtilities.appendChild(
        mapButton
      );
    }
  }

  /* ========================================
     MODAL
     ======================================== */

  const modal =
    document.createElement("div");

  modal.id = "voloCityMapModal";
  modal.className =
    "volo-city-map-modal";
  modal.hidden = true;
  modal.setAttribute(
    "role",
    "dialog"
  );
  modal.setAttribute(
    "aria-modal",
    "true"
  );
  modal.setAttribute(
    "aria-labelledby",
    "voloCityMapTitle"
  );

  modal.innerHTML = `
    <div class="volo-city-map-window">

      <button
        type="button"
        class="volo-city-map-close"
        aria-label="Chiudi la mappa · Close map"
      >×</button>

      <header class="volo-city-map-header">
        <div class="volo-city-map-title-row">
          <h2 id="voloCityMapTitle">
            🗺️ Il tuo viaggio in Italia
          </h2>

          <button
            type="button"
            class="pv-audio-button"
            data-speak-it="Il tuo viaggio in Italia"
            aria-label="Ascolta: Il tuo viaggio in Italia"
            title="Ascolta"
          >🔊</button>
        </div>
        <p>
          Esplora gli argomenti e raggiungi nuove città in tutta Italia.
          <span lang="en">
            Your Italy Journey: explore topics and unlock new cities.
          </span>
        </p>
      </header>

      <div class="volo-city-map-summary">
        <span
          class="volo-city-map-pill"
          id="voloCityTopicCount"
        ></span>
        <span
          class="volo-city-map-pill"
          id="voloCityUnlockCount"
        ></span>
      </div>


      <details
        class="volo-city-unlock-dropdown"
        id="voloCityUnlockPreview"
      >
        <summary class="volo-city-unlock-dropdown-summary">
          <span>
            ✨ Guarda un esempio di ciò che sbloccherai
            <span lang="en">· See an example</span>
          </span>

          <span
            class="volo-city-unlock-dropdown-chevron"
            aria-hidden="true"
          >⌄</span>
        </summary>

        <div class="volo-city-example">

          <div class="volo-city-example-heading">
            <span class="volo-city-example-label">
              ✨ ESEMPIO DI UNA CITTÀ SBLOCCATA
              <span lang="en">· EXAMPLE CITY UNLOCK</span>
            </span>

            <strong>Napoli · Campania</strong>
          </div>

          <img
            class="volo-city-example-diorama"
            src="images/progress/italy-journey/cities/napoli.png"
            alt="Diorama di Napoli con il Vesuvio e il Golfo di Napoli"
          >

          <div class="volo-city-example-items">

            <div class="volo-city-example-item">
              <img
                id="voloCityPreviewLandmark"
                alt=""
                hidden
              >
              <div>
                <span>🏛️ Luogo da scoprire</span>
                <strong id="voloCityPreviewLandmarkName">
                  Pompeii
                </strong>
              </div>
            </div>

            <div class="volo-city-example-item">
              <img
                id="voloCityPreviewFood"
                alt=""
                hidden
              >
              <div>
                <span>🍕 Cibo regionale</span>
                <strong id="voloCityPreviewFoodName">
                  Pizza napoletana
                </strong>
              </div>
            </div>

          </div>

        </div>
      </details>

      <div class="volo-city-map-board-wrap">
        <div
          class="volo-city-map-board"
          id="voloCityMapBoard"
        >
          <img
            class="volo-city-map-underlay"
            src="images/progress/italy-journey/italy-underlay-watercolor.png"
            alt="Mappa illustrata dell'Italia"
          >

          <svg
            class="volo-city-map-route"
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <polyline
              id="voloCityRouteBase"
              class="volo-city-route-base"
              points=""
            ></polyline>

            <polyline
              id="voloCityRouteProgress"
              class="volo-city-route-progress"
              points=""
            ></polyline>
          </svg>

        </div>

        <aside
          id="voloCityArrival"
          class="volo-city-arrival"
          hidden
          aria-live="polite"
        >
          <button
            type="button"
            class="volo-city-arrival-close"
            aria-label="Chiudi · Close"
          >×</button>

          <div class="volo-city-postcard-photo">
            <img
              id="voloCityArrivalDiorama"
              class="volo-city-arrival-diorama"
              alt=""
            >
          </div>

          <div class="volo-city-arrival-copy">
            <span class="volo-city-arrival-kicker">
              🎉 Nuova tappa · New Stop
            </span>

            <div class="volo-city-arrival-title-row">
              <h3 id="voloCityArrivalTitle"></h3>

              <button
                type="button"
                id="voloCityArrivalTitleAudio"
                class="pv-audio-button pv-audio-small"
                aria-label="Ascolta il messaggio di arrivo"
                title="Ascolta"
              >🔊</button>
            </div>

            <div class="volo-city-region-audio-row">
              <span
                id="voloCityArrivalRegion"
                class="volo-city-region-stamp"
              ></span>

              <button
                type="button"
                id="voloCityArrivalRegionAudio"
                class="pv-audio-button pv-audio-small"
                aria-label="Ascolta il nome della regione"
                title="Ascolta la regione"
              >🔊</button>
            </div>

            <p class="volo-city-region-discovery">
              Scopri la regione
              <span lang="en">· Explore the Region</span>
            </p>

            <div
              id="voloCityCultureRow"
              class="volo-city-culture-row"
            ></div>

            <span
              id="voloCityArrivalBadge"
              class="volo-city-arrival-badge"
            ></span>

            <button
              type="button"
              class="volo-city-continue"
            >
              Continua il viaggio
              <span lang="en">· Continue Journey</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </aside>
      </div>

      <p class="volo-city-map-note">
        Ogni due argomenti esplorati sblocchi una nuova città.
        <span lang="en">
          Every two explored topics unlock a new city.
        </span>
        La mappa riflette la pratica completata, non un livello
        di padronanza.
      </p>
    </div>
  `;

  document.body.appendChild(modal);

  const board =
    modal.querySelector(
      "#voloCityMapBoard"
    );

  const boardWrap =
    modal.querySelector(
      ".volo-city-map-board-wrap"
    );

  const closeButton =
    modal.querySelector(
      ".volo-city-map-close"
    );

  const arrival =
    modal.querySelector(
      "#voloCityArrival"
    );

  const arrivalClose =
    modal.querySelector(
      ".volo-city-arrival-close"
    );

  const continueButton =
    modal.querySelector(
      ".volo-city-continue"
    );

  const arrivalDiorama =
    modal.querySelector(
      "#voloCityArrivalDiorama"
    );

  const arrivalTitle =
    modal.querySelector(
      "#voloCityArrivalTitle"
    );

  const arrivalRegion =
    modal.querySelector(
      "#voloCityArrivalRegion"
    );

  const arrivalTitleAudio =
    modal.querySelector(
      "#voloCityArrivalTitleAudio"
    );

  const arrivalRegionAudio =
    modal.querySelector(
      "#voloCityArrivalRegionAudio"
    );

  const cultureRow =
    modal.querySelector(
      "#voloCityCultureRow"
    );

  const arrivalBadge =
    modal.querySelector(
      "#voloCityArrivalBadge"
    );

  const topicCountNode =
    modal.querySelector(
      "#voloCityTopicCount"
    );

  const unlockCountNode =
    modal.querySelector(
      "#voloCityUnlockCount"
    );

  const routeBase =
    modal.querySelector(
      "#voloCityRouteBase"
    );

  const routeProgress =
    modal.querySelector(
      "#voloCityRouteProgress"
    );


  /*
    Homepage/Journey example preview.
    Uses the same canonical Campania landmark + food data
    already used by the unlocked-city arrival card.
  */
  function populateUnlockPreview() {
    const landmarkImage =
      modal.querySelector("#voloCityPreviewLandmark");

    const landmarkName =
      modal.querySelector("#voloCityPreviewLandmarkName");

    const foodImage =
      modal.querySelector("#voloCityPreviewFood");

    const foodName =
      modal.querySelector("#voloCityPreviewFoodName");

    const region =
      typeof window.getPassportRegionById === "function"
        ? window.getPassportRegionById("campania")
        : null;

    const landmark =
      region &&
      typeof window.getPrimaryPassportLandmark === "function"
        ? window.getPrimaryPassportLandmark(region)
        : null;

    const food =
      region &&
      typeof window.getPrimaryPassportFood === "function"
        ? window.getPrimaryPassportFood(region)
        : null;

    if (landmark?.image && landmarkImage) {
      landmarkImage.src = landmark.image;
      landmarkImage.alt =
        landmark.name || "Luogo della Campania";
      landmarkImage.hidden = false;

      if (landmarkName) {
        landmarkName.textContent =
          landmark.name || "Luogo della Campania";
      }
    }

    if (food?.image && foodImage) {
      foodImage.src = food.image;
      foodImage.alt =
        food.name || "Cibo della Campania";
      foodImage.hidden = false;

      if (foodName) {
        foodName.textContent =
          food.name || "Cibo della Campania";
      }
    }
  }

  populateUnlockPreview();

  let lastFocused = null;

  /*
    A city can be earned while the map is closed.
    Keep that newly unlocked city pending until its arrival
    postcard is actually displayed. This prevents an earned
    celebration from being lost between the practice event
    and the learner opening the Journey map.
  */
  let pendingCelebrationCityId = null;
  let activeArrivalCityId = null;
  let activeArrivalIsNew = false;

  function routePoints(cities) {
    return cities
      .map(
        city =>
          `${city.x},${city.y}`
      )
      .join(" ");
  }

  function clearMapOverlay() {
    board
      .querySelectorAll(
        ".volo-city-stop," +
        ".volo-city-stop-label," +
        ".volo-city-plane"
      )
      .forEach(node => node.remove());
  }

  function escapeAttribute(value) {
    return String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll('"', "&quot;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
  }

  function cultureCard(
    label,
    item
  ) {
    if (!item?.image) {
      return "";
    }

    const spokenName =
      escapeAttribute(
        item.name || ""
      );

    return `
      <div class="volo-city-culture-card">
        <img
          src="${item.image}"
          alt="${item.name || label}"
        >
        <span class="volo-city-culture-label">
          ${label}
        </span>

        <strong>
          ${item.name || ""}
        </strong>

        ${
          spokenName
            ? `
              <button
                type="button"
                class="pv-audio-button pv-audio-small volo-city-culture-audio"
                data-speak-it="${spokenName}"
                aria-label="Ascolta: ${spokenName}"
                title="Ascolta"
              >🔊</button>
            `
            : ""
        }
      </div>
    `;
  }

  function showArrival(
    city,
    automatic = false
  ) {
    activeArrivalCityId = city.id;
    activeArrivalIsNew = automatic;

    const region =
      typeof window.getPassportRegionById ===
        "function"
        ? window.getPassportRegionById(
            city.regionId
          )
        : null;

    const landmark =
      region &&
      typeof window.getPrimaryPassportLandmark ===
        "function"
        ? window.getPrimaryPassportLandmark(
            region
          )
        : null;

    const food =
      region &&
      typeof window.getPrimaryPassportFood ===
        "function"
        ? window.getPrimaryPassportFood(
            region
          )
        : null;

    arrivalDiorama.src =
      `images/progress/italy-journey/cities/${city.id}.png`;

    arrivalDiorama.alt =
      `Diorama di ${city.name}`;

    const arrivalPhrase =
      `Sei arrivato a ${city.name}!`;

    arrivalTitle.textContent =
      arrivalPhrase;

    arrivalTitleAudio.dataset.speakIt =
      arrivalPhrase;

    const regionEnglish =
      region?.english &&
      region.english.trim().toLocaleLowerCase() !==
        region.region.trim().toLocaleLowerCase()
        ? `<small lang="en">${region.english}</small>`
        : "";

    arrivalRegion.innerHTML =
      region
        ? `${region.region}${regionEnglish}`
        : "";

    if (region?.region) {
      arrivalRegionAudio.hidden = false;
      arrivalRegionAudio.dataset.speakIt =
        region.region;
    } else {
      arrivalRegionAudio.hidden = true;
      arrivalRegionAudio.removeAttribute(
        "data-speak-it"
      );
    }

    cultureRow.innerHTML =
      cultureCard(
        "🏛️ Luogo della regione",
        landmark
      ) +
      cultureCard(
        "🍴 Cibo della regione",
        food
      );

    arrivalBadge.textContent =
      automatic
        ? `✨ Nuova città! · New City!`
        : `🧳 ${effectiveExploredCount()} argomenti esplorati · topics explored`;

    arrival.classList.toggle("is-new", automatic);
    boardWrap.classList.add("has-arrival");
    arrival.hidden = false;

    if (
      automatic &&
      !journeyPreview
    ) {
      const celebrated =
        new Set(
          journeyData.celebratedCities
        );

      celebrated.add(city.id);

      journeyData.celebratedCities =
        [...celebrated];

      saveJourneyData();
    }

    window.requestAnimationFrame(
      () => arrivalClose.focus()
    );
  }

  function hideArrival() {
    if (
      activeArrivalIsNew &&
      activeArrivalCityId &&
      !journeyPreview
    ) {
      const celebrated =
        new Set(
          journeyData.celebratedCities
        );

      celebrated.add(
        activeArrivalCityId
      );

      journeyData.celebratedCities =
        [...celebrated];

      if (
        pendingCelebrationCityId ===
        activeArrivalCityId
      ) {
        pendingCelebrationCityId = null;
      }

      saveJourneyData();
    }

    activeArrivalCityId = null;
    activeArrivalIsNew = false;

    arrival.hidden = true;
    arrival.classList.remove("is-new");
    boardWrap.classList.remove("has-arrival");
  }

  function renderMap() {
    syncExploredTopics();

    const count =
      effectiveExploredCount();

    const unlocked =
      unlockedCities();

    const unlockedIds =
      new Set(
        unlocked.map(
          city => city.id
        )
      );

    const currentCity =
      unlocked[
        unlocked.length - 1
      ] || null;

    topicCountNode.textContent =
      `${journeyPreview ? "🧪 Preview · " : "✓ "}${count} argomenti esplorati · topics explored`;

    unlockCountNode.textContent =
      `📍 ${unlocked.length} / ${CITY_STOPS.length} città · cities`;

    routeBase.setAttribute(
      "points",
      routePoints(CITY_STOPS)
    );

    routeProgress.setAttribute(
      "points",
      routePoints(unlocked)
    );

    clearMapOverlay();

    CITY_STOPS.forEach(
      (city, index) => {
        const unlockedNow =
          unlockedIds.has(city.id);

        const marker =
          document.createElement(
            "button"
          );

        marker.type = "button";

        const nextCity =
          CITY_STOPS.find(
            stop =>
              count < stop.unlockAt
          ) || null;

        marker.className =
          "volo-city-stop" +
          (
            unlockedNow
              ? " is-unlocked"
              : ""
          ) +
          (
            currentCity?.id ===
              city.id
              ? " is-current"
              : ""
          ) +
          (
            nextCity?.id ===
              city.id
              ? " is-next"
              : ""
          );

        marker.dataset.city =
          city.id;

        marker.style.left =
          `${city.x}%`;

        marker.style.top =
          `${city.y}%`;

        if (unlockedNow) {
          const landmark =
            document.createElement(
              "img"
            );

          landmark.className =
            "volo-city-stop-art";

          landmark.src =
            cityArtworkPath(city);

          landmark.alt = "";

          marker.appendChild(
            landmark
          );
        } else {
          marker.textContent =
            String(index + 1);
        }

        marker.setAttribute(
          "aria-label",
          unlockedNow
            ? (
                currentCity?.id === city.id
                  ? `${city.name} — tappa attuale, città raggiunta`
                  : `${city.name} — città raggiunta`
              )
            : `${city.name} — si sblocca dopo ${city.unlockAt} argomenti esplorati`
        );

        if (unlockedNow) {
          marker.addEventListener(
            "click",
            () =>
              showArrival(
                city,
                false
              )
          );
        } else {
          marker.disabled = true;
        }

        board.appendChild(marker);

        const label =
          document.createElement(
            "button"
          );

        label.type = "button";
        label.className =
          "volo-city-stop-label";

        label.style.left =
          `calc(${city.x}% + ${city.labelDx || 0}px)`;

        label.style.top =
          `calc(${city.y}% + ${city.labelDy || 18}px)`;

        label.dataset.speakIt =
          city.name;

        label.setAttribute(
          "aria-label",
          `Ascolta: ${city.name}`
        );

        const cityName =
          document.createElement("span");

        cityName.textContent =
          city.name;

        const speaker =
          document.createElement("span");

        speaker.className =
          "volo-city-label-speaker";

        speaker.setAttribute(
          "aria-hidden",
          "true"
        );

        speaker.textContent = "🔊";

        label.append(
          cityName,
          speaker
        );

        board.appendChild(label);
      }
    );

    if (currentCity) {
      const plane =
        document.createElement(
          "span"
        );

      plane.className =
        "volo-city-plane";

      plane.style.left =
        `calc(${currentCity.x}% + 27px)`;

      plane.style.top =
        `calc(${currentCity.y}% - 20px)`;

      plane.textContent = "✈️";

      board.appendChild(plane);
    }
  }

  function celebrateNewestUnseenCity() {
    if (journeyPreview) {
      const previewCity =
        CITY_STOPS.find(
          city =>
            city.id ===
            journeyPreview.cityId
        );

      if (previewCity) {
        showArrival(
          previewCity,
          true
        );
      }

      return;
    }

    if (pendingCelebrationCityId) {
      const pendingCity =
        unlockedCities().find(
          city =>
            city.id ===
            pendingCelebrationCityId
        );

      pendingCelebrationCityId = null;

      if (pendingCity) {
        showArrival(
          pendingCity,
          true
        );
        return;
      }
    }

    const unlocked =
      unlockedCities();

    const celebrated =
      new Set(
        journeyData.celebratedCities
      );

    const newest =
      [...unlocked]
        .reverse()
        .find(
          city =>
            !celebrated.has(
              city.id
            )
        );

    if (newest) {
      showArrival(
        newest,
        true
      );
    }
  }

  function openMap() {
    lastFocused =
      document.activeElement;

    renderMap();

    modal.hidden = false;

    document.body.style.overflow =
      "hidden";

    window.requestAnimationFrame(
      () => {
        celebrateNewestUnseenCity();

        if (arrival.hidden) {
          closeButton.focus();
        }
      }
    );
  }

  function closeMap() {
    hideArrival();
    modal.hidden = true;
    document.body.style.overflow = "";

    if (
      lastFocused &&
      typeof lastFocused.focus ===
        "function"
    ) {
      lastFocused.focus();
    }
  }

  mapButton.addEventListener(
    "click",
    openMap
  );

  journeyCardButton.addEventListener(
    "click",
    openMap
  );

  closeButton.addEventListener(
    "click",
    closeMap
  );

  arrivalClose.addEventListener(
    "click",
    hideArrival
  );

  continueButton.addEventListener(
    "click",
    hideArrival
  );

  modal.addEventListener(
    "click",
    event => {
      if (event.target === modal) {
        closeMap();
      }
    }
  );

  document.addEventListener(
    "keydown",
    event => {
      if (
        event.key === "Escape" &&
        !modal.hidden
      ) {
        if (!arrival.hidden) {
          hideArrival();
        } else {
          closeMap();
        }
      }
    }
  );

  document.addEventListener(
    "voloflightpathchange",
    () => {
      const unlockedBefore =
        new Set(
          unlockedCities().map(
            city => city.id
          )
        );

      const changed =
        syncExploredTopics();

      if (changed) {
        const newlyUnlocked =
          unlockedCities().filter(
            city =>
              !unlockedBefore.has(
                city.id
              )
          );

        if (newlyUnlocked.length) {
          pendingCelebrationCityId =
            newlyUnlocked[
              newlyUnlocked.length - 1
            ].id;
        }
      }

      renderJourneyCard();

      if (!modal.hidden) {
        renderMap();

        if (changed) {
          celebrateNewestUnseenCity();
        }
      }
    }
  );

  window.addEventListener(
    "primo-volo-student-changed",
    () => {
      pendingCelebrationCityId = null;
      activeArrivalCityId = null;
      activeArrivalIsNew = false;

      journeyData =
        loadJourneyData();

      renderJourneyCard();

      if (!modal.hidden) {
        hideArrival();
        renderMap();
      }
    }
  );

  renderJourneyCard();

  window.getVoloCityJourneyData =
    function getVoloCityJourneyData() {
      syncExploredTopics();
      return {
        ...journeyData,
        exploredCount:
          exploredCount(),
        unlockedCities:
          unlockedCities()
            .map(city => city.id)
      };
    };
})();
