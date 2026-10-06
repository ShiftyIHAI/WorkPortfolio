let contentItems = [];
let invites = [];
const calendar = [];
const stats = [];

const inviteList = document.querySelector("#inviteList");
const calendarGrid = document.querySelector("#calendarGrid");
const statsGrid = document.querySelector("#statsGrid");
const conflictNotice = document.querySelector("#conflictNotice");
const themeToggle = document.querySelector("#themeToggle");
let activeFilter = "all";

// Auth state — read synchronously so overlay shows before first paint
let authToken = null;
let currentUser = null;
try {
  authToken = localStorage.getItem("sq-session");
  currentUser = localStorage.getItem("sq-user");
} catch {}

const authOverlay = document.getElementById("authOverlay");
const userBadge = document.getElementById("userBadge");
const userLabel = document.getElementById("userLabel");
let teamInvites = [];
let myGroup = null;
let selectedMember = null;
const channelCache = {};
let groupChannels = [];

if (!authToken) {
  authOverlay.classList.add("visible");
}

// ---- Theme ----

function setTheme(mode) {
  const isDark = mode === "dark";
  document.documentElement.dataset.theme = isDark ? "dark" : "light";
  document.body.classList.toggle("dark-mode", isDark);
  themeToggle.setAttribute("aria-pressed", String(isDark));
  themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
  themeToggle.querySelector(".theme-toggle-label").textContent = isDark ? "Light" : "Dark";
  try {
    localStorage.setItem("content-planner-theme", isDark ? "dark" : "light");
  } catch {
    // Theme still changes for the current page if storage is unavailable.
  }
}

function initTheme() {
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem("content-planner-theme");
  } catch {
    savedTheme = null;
  }
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(savedTheme || (prefersDark ? "dark" : "light"));
}

// ---- Helpers ----

function platformClass(platform) {
  return `platform-${platform.toLowerCase()}`;
}

function contentCard(item) {
  return `
    <article class="content-card ${platformClass(item.platform)}">
      <div class="thumb">${item.platform}</div>
      <div>
        <h3>${item.title}</h3>
        <p>${item.description}</p>
        <div class="meta-line">
          <span>${item.time}</span>
          <span>${item.owner}</span>
          <span>${item.collaborators}</span>
        </div>
      </div>
      <span class="status-pill ${item.status}">${item.status}</span>
    </article>
  `;
}

function formatDateTime(value) {
  if (!value) {
    return "Unscheduled";
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function fromApiContent(item) {
  return {
    title: item.title,
    platform: item.platform,
    status: item.status,
    owner: item.owner,
    time: formatDateTime(item.scheduled_for),
    scheduled_for: item.scheduled_for,
    collaborators: item.collaborators,
    description: item.description,
  };
}

function fromApiInvite(invite) {
  return {
    title: invite.title,
    from: invite.sender,
    to: invite.recipient,
    time: formatDateTime(invite.scheduled_for),
    status: invite.status,
  };
}

// ---- Auth helpers ----

function authHeaders() {
  return {
    "Authorization": `Bearer ${authToken}`,
    "Content-Type": "application/json",
  };
}

function showAuthScreen() {
  authOverlay.classList.add("visible");
}

function hideAuthScreen() {
  authOverlay.classList.remove("visible");
}

function updateUserBadge() {
  if (currentUser) {
    userBadge.removeAttribute("hidden");
    userLabel.textContent = `@${currentUser}`;
    const ownerInput = document.getElementById("planOwner");
    if (ownerInput) ownerInput.value = currentUser;
  } else {
    userBadge.setAttribute("hidden", "");
  }
}

function updateGroupLabel() {
  const label = document.getElementById("sidebarGroupLabel");
  if (label) label.textContent = myGroup ? myGroup.name : "No group";
}

// ---- API loading ----

async function loadApiData() {
  try {
    const [contentResponse, invitesResponse] = await Promise.all([
      fetch("/api/content"),
      fetch("/api/invites"),
    ]);

    if (contentResponse.ok) {
      contentItems = (await contentResponse.json()).map(fromApiContent);
    }

    if (invitesResponse.ok) {
      invites = (await invitesResponse.json()).map(fromApiInvite);
    }
  } catch {
    // The static file can still run without the API server.
  }
}

async function loadGroup() {
  if (!authToken) return;
  try {
    const res = await fetch("/api/groups/mine", { headers: authHeaders() });
    if (res.ok) {
      myGroup = await res.json();
    }
  } catch {}
}

async function loadTeamInvites() {
  if (!authToken) return;
  try {
    const res = await fetch("/api/team-invites", { headers: authHeaders() });
    if (res.ok) {
      teamInvites = await res.json();
    } else if (res.status === 401) {
      authToken = null;
      currentUser = null;
      try {
        localStorage.removeItem("sq-session");
        localStorage.removeItem("sq-user");
      } catch {}
      showAuthScreen();
      updateUserBadge();
    }
  } catch {}
}

async function loadGroupChannels() {
  if (!authToken || !myGroup) { groupChannels = []; return; }
  try {
    const res = await fetch("/api/channels/group", { headers: authHeaders() });
    if (res.ok) groupChannels = await res.json();
    else groupChannels = [];
  } catch { groupChannels = []; }
}

// ---- Render functions ----

function filteredContent(platform) {
  return contentItems.filter((item) => {
    const matchesFilter = activeFilter === "all" || item.status === activeFilter;
    const matchesPlatform = !platform || item.platform === platform;
    return matchesFilter && matchesPlatform;
  });
}

function renderContent() {
  document.querySelectorAll("[data-platform-feed]").forEach((feed) => {
    const platform = feed.dataset.platformFeed;
    feed.innerHTML = filteredContent(platform).map(contentCard).join("") || `<p class="notice">No ${platform} items yet.</p>`;
  });
}

function renderDashboard() {
  const now = new Date();
  const nextUpEl = document.getElementById("nextUpCard");
  const myUpcomingEl = document.getElementById("myUpcomingList");
  const teamUpcomingEl = document.getElementById("teamUpcomingList");
  if (!nextUpEl || !myUpcomingEl || !teamUpcomingEl) return;

  const upcoming = contentItems
    .filter((item) => item.scheduled_for && new Date(item.scheduled_for) > now)
    .sort((a, b) => new Date(a.scheduled_for) - new Date(b.scheduled_for));

  const mine = upcoming.filter((item) => !currentUser || item.owner === currentUser);
  const others = upcoming.filter((item) => currentUser && item.owner !== currentUser);

  if (mine.length) {
    const next = mine[0];
    nextUpEl.innerHTML = `
      <article class="next-up-card ${platformClass(next.platform)}">
        <div class="next-up-thumb">${next.platform}</div>
        <div class="next-up-info">
          <span class="platform-badge platform-${next.platform.toLowerCase()}">${next.platform}</span>
          <h3>${next.title}</h3>
          ${next.description ? `<p>${next.description}</p>` : ""}
          <div class="meta-line">
            <span>${next.time}</span>
            ${next.collaborators ? `<span>with ${next.collaborators}</span>` : ""}
          </div>
        </div>
        <span class="status-pill ${next.status}">${next.status}</span>
      </article>
    `;
    myUpcomingEl.innerHTML = mine.slice(1).map(contentCard).join("") || '<p class="notice">Nothing else scheduled.</p>';
  } else {
    nextUpEl.innerHTML = '<p class="notice">No upcoming content scheduled yet.</p>';
    myUpcomingEl.innerHTML = "";
  }

  teamUpcomingEl.innerHTML = others.length
    ? others.map((item) => `
        <div class="time-block">
          <time>${item.time}</time>
          <div><strong>${item.title}</strong><span>${item.owner} · ${item.platform}</span></div>
        </div>
      `).join("")
    : '<p class="notice">No upcoming events from teammates.</p>';
}

function renderInvites() {
  inviteList.innerHTML = invites.map((invite) => `
    <article class="invite-card">
      <div>
        <h3>${invite.title}</h3>
        <p>${invite.from} invited ${invite.to} · ${invite.time}</p>
      </div>
      <div class="invite-actions">
        <span class="status-pill ${invite.status === "Pending" ? "review" : "scheduled"}">${invite.status}</span>
        <button class="btn secondary" type="button">Details</button>
      </div>
    </article>
  `).join("");
}

function renderCalendar() {
  if (!calendar.length) {
    calendarGrid.innerHTML = '<p class="notice">No events scheduled yet. Add content plans to see them here.</p>';
    return;
  }
  calendarGrid.innerHTML = calendar.map((day) => `
    <article class="calendar-day">
      <h3>${day.day} ${day.date}</h3>
      ${day.events.map((event) => `
        <div class="calendar-event ${event.conflict ? "conflict" : ""}">
          <strong>${event.time}</strong>
          ${event.title}
        </div>
      `).join("")}
    </article>
  `).join("");
}

function renderStats() {
  const heading = document.getElementById("statsHeading");
  if (!myGroup) {
    if (heading) heading.textContent = "Members";
    statsGrid.innerHTML = '<p class="notice">You\'re not in a group yet. Create one when signing up, or accept a team invite.</p>';
    return;
  }
  if (heading) heading.textContent = myGroup.name;
  statsGrid.innerHTML = myGroup.members.map((m) => `
    <article class="member-card${m.username === selectedMember ? " active" : ""}" data-username="${m.username}">
      <div class="member-avatar">${m.username.slice(0, 2).toUpperCase()}</div>
      <div>
        <h3>@${m.username}${m.username === currentUser ? " (you)" : ""}</h3>
        <p>${m.username === myGroup.owner_username ? "Group owner" : "Member"}</p>
      </div>
      ${myGroup.owner_username === currentUser && m.username !== currentUser
        ? `<button class="btn secondary kick-btn" data-username="${m.username}" type="button" style="margin-left:auto;height:36px;padding:0 14px;font-size:13px">Remove</button>`
        : ""}
    </article>
  `).join("");
  statsGrid.querySelectorAll(".member-card").forEach((card) => {
    card.addEventListener("click", (e) => {
      if (e.target.classList.contains("kick-btn")) return;
      selectMember(card.dataset.username);
    });
  });
  statsGrid.querySelectorAll(".kick-btn").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      kickMember(btn.dataset.username);
    });
  });
  if (selectedMember) {
    renderChannelPanel(selectedMember);
  }
}

async function selectMember(username) {
  selectedMember = username;
  renderStats();
}

async function kickMember(username) {
  if (!confirm(`Remove @${username} from the group?`)) return;
  try {
    const res = await fetch(`/api/groups/members/${encodeURIComponent(username)}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      if (selectedMember === username) selectedMember = null;
      await loadGroup();
      await loadGroupChannels();
      renderStats();
      renderMyChannelStrip("Twitch", "twitchChannelStrip");
      renderMyChannelStrip("YouTube", "youtubeChannelStrip");
      renderChannelStrip(null, "overviewChannelStrip");
      renderTeamChannelGrid();
    } else {
      const err = await res.json();
      alert(err.detail || "Could not remove member.");
    }
  } catch {
    alert("Could not connect to server.");
  }
}

async function loadChannels(username) {
  if (channelCache[username]) return channelCache[username];
  if (!authToken) return [];
  try {
    const endpoint = username === currentUser
      ? "/api/channels/mine"
      : `/api/channels/user/${encodeURIComponent(username)}`;
    const res = await fetch(endpoint, { headers: authHeaders() });
    if (res.ok) {
      channelCache[username] = await res.json();
      return channelCache[username];
    }
  } catch {}
  return [];
}

async function renderChannelPanel(username) {
  const label = document.getElementById("channelViewLabel");
  const nameEl = document.getElementById("channelViewName");
  const addBtn = document.getElementById("addChannelBtn");
  const form = document.getElementById("addChannelForm");
  const list = document.getElementById("channelList");
  if (!list) return;

  if (label) label.textContent = username === currentUser ? "My channels" : `@${username}'s channels`;
  if (nameEl) nameEl.textContent = `@${username}`;
  if (addBtn) addBtn.hidden = username !== currentUser;
  if (form) form.hidden = true;
  if (addBtn && username === currentUser) addBtn.hidden = false;

  list.innerHTML = '<p class="notice">Loading…</p>';
  const channels = await loadChannels(username);

  if (!channels.length) {
    list.innerHTML = `<p class="notice">${username === currentUser ? "You haven't added any channels yet. Click <strong>+ Add channel</strong> to get started." : `@${username} hasn't added any channels yet.`}</p>`;
    return;
  }

  list.innerHTML = channels.map((ch) => {
    const initials = ch.channel_name.slice(0, 2).toUpperCase();
    const avatarInner = ch.avatar_url
      ? `<img src="${ch.avatar_url}" alt="${ch.channel_name}" onerror="this.parentElement.classList.remove('has-image');this.outerHTML='${initials}'">`
      : initials;
    return `
      <article class="channel-card">
        <div class="channel-avatar${ch.avatar_url ? " has-image" : ""}">${avatarInner}</div>
        <div class="channel-info">
          <div class="channel-title">
            <h3>${ch.channel_name}</h3>
            <span class="platform-badge platform-${ch.platform.toLowerCase()}">${ch.platform}</span>
          </div>
          <p class="channel-tag">${ch.tag_name}</p>
          <p class="channel-subs">${ch.sub_count} subscribers</p>
        </div>
        ${username === currentUser ? `<button class="btn secondary channel-delete-btn" data-id="${ch.id}" type="button">Remove</button>` : ""}
      </article>
    `;
  }).join("");

  if (username === currentUser) {
    list.querySelectorAll(".channel-delete-btn").forEach((btn) => {
      btn.addEventListener("click", () => deleteChannel(Number(btn.dataset.id)));
    });
  }
}

async function deleteChannel(id) {
  try {
    const res = await fetch(`/api/channels/${id}`, {
      method: "DELETE",
      headers: authHeaders(),
    });
    if (res.ok) {
      delete channelCache[currentUser];
      await loadGroupChannels();
      renderMyChannelStrip("Twitch", "twitchChannelStrip");
      renderMyChannelStrip("YouTube", "youtubeChannelStrip");
      renderChannelStrip(null, "overviewChannelStrip");
      renderTeamChannelGrid();
    }
  } catch {}
}

function channelChipHTML(ch) {
  const initials = ch.channel_name.slice(0, 2).toUpperCase();
  const avatarInner = ch.avatar_url
    ? `<img src="${ch.avatar_url}" alt="${ch.channel_name}" onerror="this.parentElement.classList.remove('has-image');this.outerHTML='${initials}'">`
    : initials;
  return `
    <article class="channel-chip">
      <div class="channel-avatar${ch.avatar_url ? " has-image" : ""}">${avatarInner}</div>
      <div class="channel-info">
        <div class="channel-title">
          <h3>${ch.channel_name}</h3>
          <span class="platform-badge platform-${ch.platform.toLowerCase()}">${ch.platform}</span>
        </div>
        <p class="channel-tag">${ch.tag_name}</p>
        <p class="channel-subs">${ch.sub_count}</p>
      </div>
    </article>
  `;
}

function renderChannelStrip(platform, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const channels = platform ? groupChannels.filter((ch) => ch.platform === platform) : groupChannels;
  if (!channels.length) {
    el.innerHTML = '<p class="notice">No channels added yet.</p>';
    return;
  }
  el.innerHTML = channels.map(channelChipHTML).join("");
}

function renderMyChannelStrip(platform, containerId) {
  const el = document.getElementById(containerId);
  if (!el) return;
  const channels = groupChannels.filter(
    (ch) => ch.username === currentUser && (!platform || ch.platform === platform)
  );
  if (!channels.length) {
    el.innerHTML = '<p class="notice">No channels added yet.</p>';
    return;
  }
  el.innerHTML = channels.map(channelChipHTML).join("");
}

function renderTeamChannelGrid() {
  const el = document.getElementById("teamChannelGrid");
  if (!el) return;
  if (!groupChannels.length) {
    el.innerHTML = '<p class="notice">No team channels added yet.</p>';
    return;
  }
  el.innerHTML = groupChannels.map((ch) => {
    const initials = ch.channel_name.slice(0, 2).toUpperCase();
    const avatarInner = ch.avatar_url
      ? `<img src="${ch.avatar_url}" alt="${ch.channel_name}" onerror="this.parentElement.classList.remove('has-image');this.outerHTML='${initials}'">`
      : initials;
    return `
      <article class="channel-chip">
        <div class="channel-avatar${ch.avatar_url ? " has-image" : ""}">${avatarInner}</div>
        <div class="channel-info">
          <div class="channel-title">
            <h3>${ch.channel_name}</h3>
            <span class="platform-badge platform-${ch.platform.toLowerCase()}">${ch.platform}</span>
          </div>
          <p class="channel-tag">${ch.tag_name}</p>
          <p class="channel-subs">${ch.sub_count}</p>
          <p class="channel-owner">@${ch.username}</p>
        </div>
      </article>
    `;
  }).join("");
}

function renderTeamInvites() {
  const list = document.getElementById("teamInviteList");
  if (!list) return;
  if (!authToken) {
    list.innerHTML = '<p class="notice">Log in to see team invites.</p>';
    return;
  }
  if (!teamInvites.length) {
    list.innerHTML = '<p class="notice">No team invites yet.</p>';
    return;
  }
  list.innerHTML = teamInvites.map((invite) => {
    const isReceived = invite.to_user === currentUser;
    const isPending = invite.status === "pending";
    const statusClass = invite.status === "accepted" ? "scheduled" : invite.status === "declined" ? "draft" : "review";
    const date = new Date(invite.created_at + "Z").toLocaleDateString();
    return `
      <article class="invite-card">
        <div>
          <h3>${isReceived ? `@${invite.from_user} invited you` : `Invite to @${invite.to_user}`}</h3>
          <p>${date}</p>
        </div>
        <div class="invite-actions">
          <span class="status-pill ${statusClass}">${invite.status}</span>
          ${isReceived && isPending ? `
            <button class="btn primary team-accept-btn" data-id="${invite.id}" type="button">Accept</button>
            <button class="btn secondary team-decline-btn" data-id="${invite.id}" type="button">Decline</button>
          ` : ""}
        </div>
      </article>
    `;
  }).join("");

  list.querySelectorAll(".team-accept-btn").forEach((btn) => {
    btn.addEventListener("click", () => respondTeamInvite(Number(btn.dataset.id), "accept"));
  });
  list.querySelectorAll(".team-decline-btn").forEach((btn) => {
    btn.addEventListener("click", () => respondTeamInvite(Number(btn.dataset.id), "decline"));
  });
}

async function respondTeamInvite(id, action) {
  try {
    const res = await fetch(`/api/team-invites/${id}/${action}`, {
      method: "PUT",
      headers: authHeaders(),
    });
    if (res.ok) {
      await loadGroup();
      await loadGroupChannels();
      await loadTeamInvites();
      renderTeamInvites();
      renderStats();
      renderMyChannelStrip("Twitch", "twitchChannelStrip");
      renderMyChannelStrip("YouTube", "youtubeChannelStrip");
      renderChannelStrip(null, "overviewChannelStrip");
      renderTeamChannelGrid();
      updateGroupLabel();
    }
  } catch {}
}

function showSection(section) {
  document.querySelectorAll(".section-view").forEach((view) => {
    view.classList.toggle("active", view.dataset.view === section);
  });
  if (section === "dashboard") {
    document.querySelectorAll('[data-view="dashboard"]').forEach((view) => view.classList.add("active"));
  }
  document.querySelectorAll(".nav-item").forEach((item) => {
    item.classList.toggle("active", item.dataset.section === section);
  });
}

function updateConflictNotice() {
  const date = document.querySelector("#planDate").value;
  const time = document.querySelector("#planTime").value;
  if (!date || !time) {
    conflictNotice.classList.remove("warning");
    conflictNotice.textContent = "No conflict detected for this slot.";
    return;
  }
  const formatted = formatDateTime(`${date}T${time}:00`);
  const clash = contentItems.find((item) => item.time !== "Unscheduled" && item.time === formatted);
  conflictNotice.classList.toggle("warning", !!clash);
  conflictNotice.textContent = clash
    ? `Conflict detected: "${clash.title}" is already scheduled for this time.`
    : "No conflict detected for this slot.";
}

function renderMetrics() {
  const planned = contentItems.length;
  const pendingInvites = invites.filter((i) => i.status === "Pending").length
    + teamInvites.filter((i) => i.status === "pending" && i.to_user === currentUser).length;
  const conflicts = contentItems.reduce((n, item) => {
    const dupes = contentItems.filter((x) => x !== item && x.time === item.time && x.time !== "Unscheduled");
    return dupes.length ? n + 1 : n;
  }, 0) / 2 | 0;

  const els = document.querySelectorAll(".metric-value");
  if (els[0]) els[0].textContent = planned;
  if (els[1]) els[1].textContent = pendingInvites;
  if (els[2]) els[2].textContent = conflicts;
  if (els[3]) els[3].textContent = stats.length ? stats.reduce((s, p) => s + parseFloat(p.reach) || 0, 0) + "K" : "—";
}

function renderAll() {
  renderDashboard();
  renderContent();
  renderInvites();
  renderCalendar();
  renderStats();
  renderTeamInvites();
  renderMetrics();
  updateConflictNotice();
  updateGroupLabel();
  renderMyChannelStrip("Twitch", "twitchChannelStrip");
  renderMyChannelStrip("YouTube", "youtubeChannelStrip");
  renderChannelStrip(null, "overviewChannelStrip");
  renderTeamChannelGrid();
}

// ---- Navigation & filter event listeners ----

document.querySelectorAll(".nav-item").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.section));
});

document.querySelectorAll("[data-section-target]").forEach((button) => {
  button.addEventListener("click", () => showSection(button.dataset.sectionTarget));
});

document.querySelectorAll(".chip").forEach((button) => {
  button.addEventListener("click", () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll(".chip").forEach((chip) => chip.classList.toggle("active", chip === button));
    renderContent();
  });
});

document.querySelector("#planDate").addEventListener("input", updateConflictNotice);
document.querySelector("#planTime").addEventListener("input", updateConflictNotice);

document.querySelector("#plannerForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  const scheduledFor = `${document.querySelector("#planDate").value}T${document.querySelector("#planTime").value}:00`;
  const newItem = {
    title: document.querySelector("#planTitle").value,
    platform: document.querySelector("#planPlatform").value,
    status: "draft",
    owner: document.querySelector("#planOwner").value,
    time: formatDateTime(scheduledFor),
    collaborators: document.querySelector("#planInvite").value,
    description: document.querySelector("#planNotes").value,
  };

  try {
    const response = await fetch("/api/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newItem.title,
        platform: newItem.platform,
        status: newItem.status,
        owner: newItem.owner,
        collaborators: newItem.collaborators,
        scheduled_for: scheduledFor,
        description: newItem.description,
      }),
    });

    if (response.ok) {
      const savedItem = await response.json();
      contentItems.unshift(fromApiContent(savedItem));
    } else {
      contentItems.unshift(newItem);
    }
  } catch {
    contentItems.unshift(newItem);
  }

  renderContent();
  showSection("dashboard");
});

document.querySelector("#newPlanBtn").addEventListener("click", () => showSection("schedule"));
document.querySelector("#focusToday").addEventListener("click", () => showSection("schedule"));
themeToggle.addEventListener("click", () => {
  setTheme(document.documentElement.dataset.theme === "dark" ? "light" : "dark");
});

// ---- Auth event listeners ----

document.querySelectorAll(".auth-tab").forEach((tab) => {
  tab.addEventListener("click", () => {
    document.querySelectorAll(".auth-tab").forEach((t) => t.classList.toggle("active", t === tab));
    document.getElementById("loginForm").hidden = tab.dataset.authTab !== "login";
    document.getElementById("registerForm").hidden = tab.dataset.authTab !== "register";
  });
});

document.getElementById("loginForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("loginUsername").value.trim();
  const password = document.getElementById("loginPassword").value;
  const errorEl = document.getElementById("loginError");
  errorEl.hidden = true;
  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      const data = await res.json();
      authToken = data.token;
      currentUser = data.username;
      try {
        localStorage.setItem("sq-session", authToken);
        localStorage.setItem("sq-user", currentUser);
      } catch {}
      hideAuthScreen();
      updateUserBadge();
      await loadApiData();
      await loadGroup();
      await loadGroupChannels();
      await loadTeamInvites();
      renderAll();
    } else {
      const err = await res.json();
      errorEl.textContent = err.detail || "Incorrect username or password.";
      errorEl.hidden = false;
    }
  } catch {
    errorEl.textContent = "Could not connect to server.";
    errorEl.hidden = false;
  }
});

document.getElementById("registerForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const username = document.getElementById("regUsername").value.trim();
  const password = document.getElementById("regPassword").value;
  const confirm = document.getElementById("regConfirm").value;
  const groupName = document.getElementById("regGroup").value.trim();
  const errorEl = document.getElementById("registerError");
  errorEl.hidden = true;
  if (password !== confirm) {
    errorEl.textContent = "Passwords do not match.";
    errorEl.hidden = false;
    return;
  }
  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password, group_name: groupName || null }),
    });
    if (res.ok) {
      const data = await res.json();
      authToken = data.token;
      currentUser = data.username;
      try {
        localStorage.setItem("sq-session", authToken);
        localStorage.setItem("sq-user", currentUser);
      } catch {}
      hideAuthScreen();
      updateUserBadge();
      await loadApiData();
      await loadGroup();
      await loadGroupChannels();
      await loadTeamInvites();
      renderAll();
    } else {
      const err = await res.json();
      errorEl.textContent = err.detail || "Could not create account.";
      errorEl.hidden = false;
    }
  } catch {
    errorEl.textContent = "Could not connect to server.";
    errorEl.hidden = false;
  }
});

document.getElementById("logoutBtn").addEventListener("click", async () => {
  try {
    await fetch("/api/auth/logout", { method: "POST", headers: authHeaders() });
  } catch {}
  authToken = null;
  currentUser = null;
  teamInvites = [];
  myGroup = null;
  selectedMember = null;
  groupChannels = [];
  Object.keys(channelCache).forEach((k) => delete channelCache[k]);
  try {
    localStorage.removeItem("sq-session");
    localStorage.removeItem("sq-user");
  } catch {}
  updateUserBadge();
  showAuthScreen();
});

function initQuickChannelForm(addBtnId, formId, platform, stripId) {
  const addBtn = document.getElementById(addBtnId);
  const form = document.getElementById(formId);
  if (!addBtn || !form) return;

  const urlInput = form.querySelector(".quick-url-input");
  const importMsg = form.querySelector(".quick-msg");
  const fieldsPanel = form.querySelector(".quick-fields");
  const nameInput = form.querySelector(".quick-name");
  const tagInput = form.querySelector(".quick-tag");
  const subsInput = form.querySelector(".quick-subs");
  let pendingAvatarUrl = null;

  function resetForm() {
    urlInput.value = "";
    nameInput.value = "";
    tagInput.value = "";
    subsInput.value = "";
    importMsg.hidden = true;
    importMsg.classList.remove("warning");
    fieldsPanel.hidden = true;
    form.hidden = true;
    addBtn.hidden = false;
    pendingAvatarUrl = null;
  }

  addBtn.addEventListener("click", () => {
    form.hidden = false;
    addBtn.hidden = true;
    urlInput.focus();
  });

  form.querySelector(".quick-cancel-btn").addEventListener("click", resetForm);

  form.querySelector(".quick-back-btn").addEventListener("click", () => {
    fieldsPanel.hidden = true;
    importMsg.hidden = true;
  });

  form.querySelector(".quick-import-btn").addEventListener("click", async () => {
    const url = urlInput.value.trim();
    if (!url) return;
    importMsg.hidden = true;
    importMsg.classList.remove("warning");
    const importBtn = form.querySelector(".quick-import-btn");
    importBtn.textContent = "Importing…";
    importBtn.disabled = true;
    try {
      const res = await fetch("/api/channels/import", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (res.ok) {
        nameInput.value = data.channel_name || "";
        tagInput.value = data.tag_name || "";
        subsInput.value = data.sub_count || "";
        pendingAvatarUrl = data.avatar_url || null;
        fieldsPanel.hidden = false;
      } else {
        importMsg.textContent = data.detail || "Could not import channel info.";
        importMsg.classList.add("warning");
        importMsg.hidden = false;
      }
    } catch {
      importMsg.textContent = "Could not connect to server.";
      importMsg.classList.add("warning");
      importMsg.hidden = false;
    } finally {
      importBtn.textContent = "Import";
      importBtn.disabled = false;
    }
  });

  form.querySelector(".quick-save-btn").addEventListener("click", async () => {
    const saveMsg = form.querySelector(".quick-save-msg");
    saveMsg.hidden = true;
    saveMsg.classList.remove("warning");
    if (!nameInput.value.trim() || !tagInput.value.trim()) {
      saveMsg.textContent = "Channel name and tag are required.";
      saveMsg.classList.add("warning");
      saveMsg.hidden = false;
      return;
    }
    try {
      const res = await fetch("/api/channels", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          platform,
          channel_name: nameInput.value.trim(),
          tag_name: tagInput.value.trim(),
          sub_count: subsInput.value.trim(),
          avatar_url: pendingAvatarUrl || null,
        }),
      });
      if (res.ok) {
        delete channelCache[currentUser];
        await loadGroupChannels();
        renderMyChannelStrip(platform, stripId);
        renderChannelStrip(null, "overviewChannelStrip");
        renderTeamChannelGrid();
        resetForm();
      } else {
        const err = await res.json();
        saveMsg.textContent = err.detail || "Could not save channel.";
        saveMsg.classList.add("warning");
        saveMsg.hidden = false;
      }
    } catch {
      saveMsg.textContent = "Could not connect to server.";
      saveMsg.classList.add("warning");
      saveMsg.hidden = false;
    }
  });
}

initQuickChannelForm("addTwitchChannelBtn", "twitchQuickForm", "Twitch", "twitchChannelStrip");
initQuickChannelForm("addYoutubeChannelBtn", "youtubeQuickForm", "YouTube", "youtubeChannelStrip");

document.getElementById("teamInviteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const toUser = document.getElementById("teamInviteUsername").value.trim();
  const msg = document.getElementById("teamInviteMsg");
  msg.hidden = true;
  msg.classList.remove("warning");
  try {
    const res = await fetch("/api/team-invites", {
      method: "POST",
      headers: authHeaders(),
      body: JSON.stringify({ to_user: toUser }),
    });
    if (res.ok) {
      document.getElementById("teamInviteUsername").value = "";
      msg.textContent = `Invite sent to @${toUser}!`;
      msg.hidden = false;
      await loadTeamInvites();
      renderTeamInvites();
      setTimeout(() => { msg.hidden = true; }, 3000);
    } else {
      const err = await res.json();
      msg.textContent = err.detail || "Could not send invite.";
      msg.classList.add("warning");
      msg.hidden = false;
    }
  } catch {
    msg.textContent = "Could not connect to server.";
    msg.classList.add("warning");
    msg.hidden = false;
  }
});

// ---- Init ----

async function init() {
  initTheme();
  if (authToken) {
    updateUserBadge();
  }
  await loadApiData();
  if (authToken) {
    await loadGroup();
    await loadGroupChannels();
    await loadTeamInvites();
  }
  renderAll();
}

init();
