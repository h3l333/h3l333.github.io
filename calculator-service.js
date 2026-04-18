// A canonical or minimal cover in DBMS is the simplest set of functional dependencies equivalent to
// a given set.
// It is found by splitting right-hand sides, removing redundant functional dependencies
// and eliminating extraneous left-hand attributes.
//
// - Examples of redundant dependencies: In {A -> B, B -> C, A -> C} 'A -> C' is redundant.
// - It is determined if a left-hand attribute is extraneous by checking the
// attributes that each individual attribute on the LHS determines.

// A set of FDs is defined as an array of objects that encompass the attributes
// LHS and RHS. Each attribute holds the value of an array of chars representing attributes.

let setOfFDs = [
	{ lhs: ["B", "D"], rhs: ["A", "C"] },
	{ lhs: ["A", "B"], rhs: ["C"] },
	{ lhs: ["G", "H"], rhs: ["A", "E"] },
	{ lhs: ["B", "G"], rhs: ["E"] },
	{ lhs: ["A", "E"], rhs: ["B"] },
	{ lhs: ["A"], rhs: ["C"] },
	{ lhs: ["B"], rhs: ["A"] },
	{ lhs: ["D", "A"], rhs: ["B"] },
];

let setOfFDs2 = [
	{ lhs: ["A", "B"], rhs: ["C", "D"] },
	{ lhs: ["C"], rhs: ["B"] },
	{ lhs: ["D"], rhs: ["E"] },
	{ lhs: ["A", "B"], rhs: ["E"] },
	{ lhs: ["A", "C"], rhs: ["D"] },
	{ lhs: ["E"], rhs: ["F"] },
	{ lhs: ["A", "B"], rhs: ["F"] },
];

let setOfFDs3 = [
	{ lhs: ["A"], rhs: ["B"] },
	{ lhs: ["B"], rhs: ["C"] },
	{ lhs: ["C"], rhs: ["D"] },
	{ lhs: ["D"], rhs: ["B"] },
	{ lhs: ["A", "E"], rhs: ["F"] },
	{ lhs: ["E"], rhs: ["G"] },
	{ lhs: ["G"], rhs: ["F"] },
	{ lhs: ["A", "E"], rhs: ["G"] },
	{ lhs: ["A"], rhs: ["D"] },
];

let setOfFDs4 = [
	{ lhs: ["A", "B"], rhs: ["C"] },
	{ lhs: ["A", "B"], rhs: ["D"] },
	{ lhs: ["C"], rhs: ["E"] },
	{ lhs: ["D"], rhs: ["E"] },
	{ lhs: ["E"], rhs: ["F"] },
	{ lhs: ["B"], rhs: ["D"] },
	{ lhs: ["A"], rhs: ["C"] },
	{ lhs: ["A", "B"], rhs: ["F"] },
];

const splitRHS = (setOfFDs) => {
	let splitSetFDs = [];
	for (
		let i = 0;
		i < setOfFDs.length;
		i++ // Iterate through and push using a conditional
	) {
		let currentDependency = setOfFDs[i];
		if (currentDependency.rhs.length == 1) {
			// Push as is
			splitSetFDs.push(currentDependency);
		} else {
			for (
				let j = 0;
				j < currentDependency.rhs.length;
				j++ // Iterate through the attributes on the rhs
			) // of the dependency and push each new resulting dependency
			{
				let newDependency = {
					lhs: [...currentDependency.lhs],
					rhs: [currentDependency.rhs[j]],
				};
				splitSetFDs.push(newDependency);
			}
		}
	}
	return splitSetFDs;
};

const haveSameElements = (arr1, arr2) => {
	// Receives and compares two arrays
	let match = true;
	for (
		let i = 0;
		i < arr2.length;
		i++ // Iterate through arr2's elements
		// Does arr1 include all the elements in arr2?
	) {
		match = match && arr1.includes(arr2[i]);
	}

	for (let j = 0; j < arr1.length; j++) {
		match = match && arr2.includes(arr1[j]);
	}

	return match;
};

const calculateClosure = (attributes, setOfFDs) => {
	// Receives an array of chars representing a set of attributes and an array of
	// objects representing a set of FDs (assumes already 'split')
	let closure = [...attributes]; // Example: AB -> A, AB -> B
	let change;
	do {
		change = false;
		let closureBefore = [...closure];
		for (
			let i = 0;
			i < setOfFDs.length;
			i++ // Traverse each FD within the set
		) {
			let currentDependency = setOfFDs[i];
			if (
				currentDependency.lhs.every((attr) => closure.includes(attr))
			) // Check that the lhs of a dependency matches the passed attributes
			{
				// Then add the RHS to the closure if not already in the closure
				if (!closure.includes(setOfFDs[i].rhs[0])) {
					closure.push(...setOfFDs[i].rhs);
				}
			}
			change = haveSameElements(closureBefore, closure) ? false : true;
			// console.log("Current dependency: ", currentDependency);
			// console.log("Current closure: ", closure);
		}
	} while (change);
	return closure;
};

const removeExtraneousAttributes = (setOfFDs) => {
	let dependenciesNoExtraneous = [...setOfFDs];
	// If all attributes in the RHS can be determined without the attribute currently under scrutiny,
	// remove the attribute
	// Analyse setOfFDs, not the array to be returned
	for (let i = 0; i < setOfFDs.length; i++) {
		// Iterate through attributes on the lhs, removing one by one
		let originalDep = dependenciesNoExtraneous.find(
			(dep) =>
				haveSameElements(dep.lhs, setOfFDs[i].lhs) &&
				haveSameElements(dep.rhs, setOfFDs[i].rhs),
		); // Convenient to define to prevent synchronization issues between passed in arr and returned
		// arr
		// console.log(originalDep);
		for (let j = 0; j < setOfFDs[i].lhs.length; j++) {
			let attrsWithoutCurrentAttr = setOfFDs[i].lhs.filter(
				(attr) => attr != setOfFDs[i].lhs[j],
			);
			// console.log("Attributes w/o current 1: ", attrsWithoutCurrentAttr);
			let newClosure = calculateClosure(attrsWithoutCurrentAttr, setOfFDs);
			// console.log("Closure of ", attrsWithoutCurrentAttr, ": ", newClosure);
			// If attributes on the RHS match current closure...
			if (setOfFDs[i].rhs.every((attr) => newClosure.includes(attr))) {
				// Then remove the current dependency. Neither RHS or LHS can match
				// console.log("Buscando eliminar:", originalDep);
				// console.log("En array:", dependenciesNoExtraneous);
				dependenciesNoExtraneous = dependenciesNoExtraneous.filter(
					(dep) =>
						!haveSameElements(originalDep.rhs, dep.rhs) ||
						!haveSameElements(originalDep.lhs, dep.lhs),
				);
				// And put in the new one
				let newDependency = {
					lhs: [...attrsWithoutCurrentAttr],
					rhs: [...setOfFDs[i].rhs],
				};
				if (
					!dependenciesNoExtraneous.find(
						(dep) =>
							haveSameElements(newDependency.lhs, dep.lhs) &&
							haveSameElements(newDependency.rhs, dep.rhs),
					)
				)
					dependenciesNoExtraneous.push(newDependency);
			}
		}
	}
	return dependenciesNoExtraneous;
};

const noRedundantDependencies = (setOfFDs) => {
	let setNoRedundancies = [...setOfFDs];
	for (let i = 0; i < setOfFDs.length; i++) {
		// A dependency is redundant if it's RHS attr can be determined
		// by the determinant removing the current dependency
		let currentDependency = setNoRedundancies.find(
			(dep) =>
				haveSameElements(dep.lhs, setOfFDs[i].lhs) &&
				haveSameElements(dep.rhs, setOfFDs[i].rhs),
		);

		// console.log("Procesando:", currentDependency);

		let newClosure = calculateClosure(
			currentDependency.lhs,
			setNoRedundancies.filter(
				(dep) =>
					!haveSameElements(dep.lhs, currentDependency.lhs) ||
					!haveSameElements(dep.rhs, currentDependency.rhs),
			),
		);

		// console.log("Clausura sin ella:", newClosure);

		// console.log("Incluye RHS?:", newClosure.includes(currentDependency.rhs[0]));

		// Is the RHS attr still there?
		if (newClosure.includes(currentDependency.rhs[0])) {
			setNoRedundancies = setNoRedundancies.filter(
				(dep) =>
					!haveSameElements(dep.lhs, currentDependency.lhs) ||
					!haveSameElements(dep.rhs, currentDependency.rhs),
			);
		}
	}
	return setNoRedundancies;
};

const attributeOnlyRHS = (attribute, setOfFDs) => {
	let onlyRHS = true;
	for (let i = 0; setOfFDs.length; i++) {
		if (setOfFDs[i].lhs.includes(attribute)) onlyRHS = false;
	}
	return onlyRHS;
};

const attributeOnlyLHS = (attribute, setOfFDs) => {
	let onlyLHS = true;
	for (let i = 0; setOfFDs.length; i++) {
		if (setOfFDs[i].rhs.includes(attribute)) onlyLHS = false;
	}
	return onlyLHS;
};

const getSubsets = (arr) => {
	// For each attribute, I have a choice: to either include it or not
	// console.log("arr: ", arr);
	if (arr.length === 0) return [[]];

	let first = arr[0];
	let rest = arr.slice(1);

	let subsetsWithoutFirst = getSubsets(rest);
	let subsetsWithFirst = subsetsWithoutFirst.map((s) => [first, ...s]); // Iterates through the array and returns
	// 'transformed' values
	return [...subsetsWithoutFirst, ...subsetsWithFirst];
};

const includesCandidateKey = (candidateKeys, currentSubset) => {
	// console.log("Candidate keys: ", candidateKeys);
	// console.log("Subset: ", currentSubset);
	for (let i = 0; i < candidateKeys.length; i++) {
		// If any candidate key is included within the current subset, return true
		if (candidateKeys[i].find((attr) => currentSubset.includes(attr))) {
			console.log(
				candidateKeys[i].find((attr) => currentSubset.includes(attr))
					? true
					: false,
			);
			return true;
		}
	}
	return false;
};

const getCandidateKeys = (relationalSchema, setOfFDs) => {
	// An attribute or set of attr. is a candidate key if it's clause = the relational schema
	// An attr. will never be part of a candidate key if it never appears on the LHS
	// An attr. will always be part of the candidate key if it only appears on the LHS
	let base = [];
	let possibleAdditions = [];

	for (let i = 0; i < relationalSchema.length; i++) {
		let appearsLHS = false;
		let appearsRHS = false;
		for (let j = 0; j < setOfFDs.length; j++) {
			// Test for presence on the LHS
			if (setOfFDs[j].lhs.includes(relationalSchema[i])) appearsLHS = true;
			// Test for presence on the RHS
			if (setOfFDs[j].rhs.includes(relationalSchema[i])) appearsRHS = true;
		}
		if (appearsLHS && !appearsRHS)
			// Must be part of the base
			base.push(relationalSchema[i]);
		else if (appearsLHS && appearsRHS)
			possibleAdditions.push(relationalSchema[i]);
		// If it only appears on RHS, do nothing
	}

	if (haveSameElements(calculateClosure(base, setOfFDs), relationalSchema))
		return base;

	possibleAdditions = getSubsets(possibleAdditions).filter(
		(s) => s.length != 0,
	);

	// console.log(base);
	// console.log(possibleAdditions);
	// console.log(possibleAdditions.length);

	let candidateKeys = [];

	// Test all combinations between the base key and the available subsets;
	// If any meet the condition of 'haveSameElements(calculateClosure(base), relationalSchema)'
	// Add to the array 'candidateKeys'
	// Whenever a subset is added, any other subsets that include it cannot be candidate keys

	for (let j = 0; j < possibleAdditions.length; j++) {
		let newCombo = [...base];
		newCombo.push(...possibleAdditions[j]);
		if (
			haveSameElements(
				calculateClosure(newCombo, setOfFDs),
				relationalSchema,
			) &&
			!includesCandidateKey(candidateKeys, possibleAdditions[j])
		) {
			candidateKeys.push(newCombo);
		}
	}

	return candidateKeys;
};

setOfFDs = splitRHS(setOfFDs);
// console.log(setOfFDs);
setOfFDs = removeExtraneousAttributes(setOfFDs);
// console.log(setOfFDs);
setOfFDs = noRedundantDependencies(setOfFDs);
// console.log(setOfFDs);

const minimalCover = (setOfFDs) => {
	setOfFDs = splitRHS(setOfFDs);
	setOfFDs = removeExtraneousAttributes(setOfFDs);
	setOfFDs = noRedundantDependencies(setOfFDs);
	return setOfFDs;
};

// console.log(minimalCover(setOfFDs));
// console.log(minimalCover(setOfFDs4));

let schema = ["A", "B", "C", "D", "E"];

let setOfFDs5 = [
	{ lhs: ["A", "B"], rhs: ["C"] },
	{ lhs: ["C"], rhs: ["D"] },
	{ lhs: ["D"], rhs: ["E"] },
	{ lhs: ["B", "E"], rhs: ["A"] },
];

// console.log(getCandidateKeys(schema, setOfFDs5));

export default {
	minimalCover,
	getCandidateKeys,
	calculateClosure,
	haveSameElements,
	removeExtraneousAttributes,
	noRedundantDependencies,
	splitRHS,
};
