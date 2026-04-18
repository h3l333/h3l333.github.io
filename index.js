import calculatorService from "/calculator-service.js";

const parseFDs = (text) => {
	return text
		.trim()
		.split("\n")
		.filter((line) => line.trim() !== "")
		.map((line) => {
			const [lhsStr, rhsStr] = line.split("->");
			console.log(lhsStr, rhsStr);
			return {
				lhs: lhsStr
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean),
				rhs: rhsStr
					.split(",")
					.map((s) => s.trim())
					.filter(Boolean),
			};
		});
};

const parseAttrs = (text) =>
	text
		.split(",")
		.map((s) => s.trim())
		.filter(Boolean);

const formatFDs = (fds) =>
	fds.map((fd) => `{${fd.lhs.join(", ")}} → {${fd.rhs.join(", ")}}`).join("\n");

const getSubsets = (arr) => {
	if (arr.length === 0) return [[]];
	let first = arr[0];
	let rest = arr.slice(1);
	let without = getSubsets(rest);
	let with_ = without.map((s) => [first, ...s]);
	return [...without, ...with_];
};

const getFDs = () => {
	try {
		return parseFDs(document.getElementById("fds-input").value);
	} catch (e) {
		return null;
	}
};

const runClosure = () => {
	const fds = getFDs();
	const attrs = parseAttrs(document.getElementById("closure-attrs").value);
	if (!fds || attrs.length === 0) {
		document.getElementById("closure-result").textContent =
			"Please enter FDs and attributes.";
		return;
	}
	const split = calculatorService.splitRHS(fds);
	const closure = calculatorService.calculateClosure(attrs, split);
	document.getElementById("closure-result").textContent =
		`{${attrs.join(", ")}}⁺ = {${closure.join(", ")}}`;
};

const runMinimalCover = () => {
	const fds = getFDs();
	if (!fds) {
		document.getElementById("minimal-result").textContent = "Please enter FDs.";
		return;
	}
	const result = calculatorService.minimalCover(fds);
	document.getElementById("minimal-result").textContent = formatFDs(result);
};

const runCandidateKeys = () => {
	const fds = getFDs();
	const schema = parseAttrs(document.getElementById("schema-input").value);
	if (!fds || schema.length === 0) {
		document.getElementById("keys-result").textContent =
			"Please enter FDs and schema.";
		return;
	}
	const split = calculatorService.splitRHS(fds);
	const keys = calculatorService.getCandidateKeys(schema, split);
	console.log(keys);
	if (keys.length === 0) {
		document.getElementById("keys-result").textContent =
			"No candidate keys found.";
	} else {
		document.getElementById("keys-result").textContent = keys
			.map((k) => `{${k.join(", ")}}`)
			.join("\n");
	}
};

document.addEventListener("DOMContentLoaded", () => {
	document.getElementById("closure-btn").addEventListener("click", runClosure);
	document
		.getElementById("minimal-cover-btn")
		.addEventListener("click", runMinimalCover);
	document
		.getElementById("candidate-keys-btn")
		.addEventListener("click", runCandidateKeys);
});
