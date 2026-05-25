export const getInitials = (name?: string) => {
	if (!name) return "?";

	return name
		.split(" ")
		.filter(Boolean)
		.map((word) => word[0])
		.join("")
		.slice(0, 2)
		.toUpperCase();
};
