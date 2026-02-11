export const getPriorityColor = (priority) => {
  switch (priority) {
    case "High":
      return "#ffadad";
    case "Medium":
      return "#ffd6a5";
    case "Low":
      return "#caffbf";
    default:
      return "#e0e0e0";
  }
};

export const getCategoryColor = (category) => {
  switch (category) {
    case "Bug":
      return "red";
    case "Feature":
      return "blue";
    case "Enhancement":
      return "green";
    default:
      return "grey";
  }
};
