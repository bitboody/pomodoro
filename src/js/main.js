const timer = {
	pomodoro: localStorage.getItem("pomodoro") || 25,
	shortBreak: localStorage.getItem("shortBreak") || 5,
	longBreak: localStorage.getItem("longBreak") || 15,
	longBreakInterval: localStorage.getItem("longBreakInterval") || 4,
	session: 0,
};

let interval;

const mainButton = document.getElementById("js-btn");
const buttonSound = new Audio("../assets/button-sound.mp3");

mainButton.addEventListener("click", () => {
	buttonSound.play();
	const { action } = mainButton.dataset;
	if (action === "start") {
		startTimer();
	} else {
		stopTimer();
	}
});

const audio = new Audio("../assets/whitenoise.mp3");
audio.loop = true;
audio.oncanplay = () => {
	if (document.getElementById("sound-chkbx").checked) this.play();
};

function checkboxToggle(el) {
	if (el.checked) {
		audio.load();
	}
	audio.pause();
}

const modeButtons = document.querySelector("#js-mode-buttons");
modeButtons.addEventListener("click", handleMode);

function handleMode(event) {
	const { mode } = event.target.dataset;

	if (!mode) return;

	switchMode(mode);
	stopTimer();
}

function getRemainingTime(endTime) {
	const currentTime = Date.parse(new Date());
	const difference = endTime - currentTime;

	const total = Number.parseInt(difference / 1000, 10);
	const minutes = Number.parseInt((total / 60) % 60, 10);
	const seconds = Number.parseInt(total % 60, 10);

	return {
		total,
		minutes,
		seconds,
	};
}

function startTimer() {
	let { total } = timer.remainingTime;
	const endTime = Date.parse(new Date()) + total * 1000;

	if (timer.mode === "pomodoro") timer.session++;

	mainButton.dataset.action = "stop";
	mainButton.textContent = "stop";
	mainButton.classList.add("active");

	interval = setInterval(() => {
		timer.remainingTime = getRemainingTime(endTime);
		updateClock();

		total = timer.remainingTime.total;
		if (total <= 0) {
			clearInterval(interval);
			switch (timer.mode) {
				case "pomodoro":
					if (timer.session % timer.longBreakInterval === 0) {
						switchMode("longBreak");
					} else {
						switchMode("shortBreak");
					}
					break;
				default:
					switchMode("pomodoro");
			}
			document.querySelector(`[data-sound="${timer.mode}"]`).play();
			startTimer();
		}
	}, 1000);
}

function stopTimer() {
	clearInterval(interval);

	mainButton.dataset.action = "start";
	mainButton.textContent = "start";
	mainButton.classList.remove("active");
}

function updateClock() {
	const { remainingTime } = timer;
	const minutes = `${remainingTime.minutes}`.padStart(2, "0");
	const seconds = `${remainingTime.seconds}`.padStart(2, "0");

	const min = document.getElementById("js-minutes");
	const sec = document.getElementById("js-seconds");
	min.textContent = minutes;
	sec.textContent = seconds;

	const text = timer.mode === "pomodoro" ? "Time to Focus!" : "Take a break!";
	document.title = `${minutes}:${seconds} — ${text}`;

	const progress = document.getElementById("js-progress");
	progress.value = timer[timer.mode] * 60 - timer.remainingTime.total;
}

function switchMode(mode) {
	timer.mode = mode;
	timer.remainingTime = {
		total: timer[mode] * 60,
		minutes: timer[mode],
		seconds: 0,
	};

	document
		.querySelectorAll("button[data-mode]")
		.forEach((e) => e.classList.remove("active"));
	document.querySelector(`[data-mode="${mode}"]`).classList.add("active");
	document.body.style.backgroundColor = `var(--${mode})`;
	document
		.getElementById("js-progress")
		.setAttribute("max", timer.remainingTime.total);

	updateClock();
}

document.addEventListener("DOMContentLoaded", () => {
	if (`Notification` in window) {
		if (
			Notification.permission !== "granted" &&
			Notification.permission !== "denied"
		) {
			Notification.requestPermission().then((permission) => {
				if (permission === "granted") {
					new Notification(
						"Awesome! You will be notified at the start of each session"
					);
				}
			});
		}
	}
	switchMode("pomodoro");
	if (Notification.permission === "granted") {
		const text =
			timer.mode === "pomodoro" ? "Time to focus!" : "Take a break!";
		new Notification(text);
	}
});

const settings = document.getElementById("settings");
const app = document.querySelector(".app");

settings.addEventListener("click", () => {
	if (settings.checked === true)
		setTimeout(() => {
			app.style.visibility = "hidden";
		}, 200);
	else {
		setTimeout(() => {
			app.style.visibility = "visible";
		}, 300);
	}
});

const pomodoroSetting = document.getElementById("pomodoro-setting");
const breakSetting = document.getElementById("break-setting");
const lbreakSetting = document.getElementById("lbreak-setting");
const lbreakInterval = document.getElementById("lbreak-interval");

pomodoroSetting.addEventListener("keyup", () => {
	if (e.key === "Enter") {
		if (
			pomodoroSetting.value === "" ||
			typeof Number(pomodoroSetting.value) !== "number"
		)
			return;

		let time = Number(pomodoroSetting.value);
		if (pomodoroSetting.value > pomodoroSetting.max) time = 25;
		if (pomodoroSetting.value < pomodoroSetting.min) time = 25;

		timer.pomodoro = time;
		localStorage.setItem("pomodoro", time);
		location.reload();
	}
});

breakSetting.addEventListener("keyup", () => {
	if (e.key === "Enter") {
		if (
			breakSetting.value === "" ||
			typeof Number(breakSetting.value) !== "number"
		)
			return;

		let time = Number(breakSetting.value);
		if (breakSetting.value > breakSetting.max) time = 5;
		if (breakSetting.value < breakSetting.min) time = 5;

		timer.shortBreak = time;
		localStorage.setItem("shortBreak", time);
		location.reload();
	}
});

lbreakSetting.addEventListener("keyup", (e) => {
	if (e.key === "Enter") {
		if (
			lbreakSetting.value === "" ||
			typeof Number(lbreakSetting.value) !== "number"
		)
			return;

		let time = Number(lbreakSetting.value);
		if (lbreakSetting.value > lbreakSetting.max) time = 15;
		if (lbreakSetting.value < lbreakSetting.min) time = 15;

		timer.longBreak = time;
		localStorage.setItem("longBreak", time);
		location.reload();
	}
});

lbreakInterval.addEventListener("keyup", () => {
	if (e.key === "Enter") {
		if (
			lbreakInterval.value === "" ||
			typeof Number(lbreakInterval.value) !== "number"
		)
			return;

		let interval = Number(lbreakInterval.value);
		if (lbreakInterval.value > lbreakInterval.max) interval = 15;
		if (lbreakInterval.value < lbreakInterval.min) interval = 15;

		timer.longBreakInterval = interval;
		localStorage.setItem("longBreakInterval", interval);
		location.reload();
	}
});
