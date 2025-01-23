import { useSearchParams } from "react-router-dom";
import Select from "./Select";
import PropTypes from "prop-types";

function SortBy({ options }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const sortBy = searchParams.get("sortBy") || "";

  function handleChange(e) {
    searchParams.set("sortBy", e.target.value);
    setSearchParams(searchParams);
  }

  return (
    <Select
      options={options}
      type="white"
      value={sortBy}
      onChange={handleChange}
    />
  );
}
SortBy.propTypes = {
  options: PropTypes.arrayOf(
    PropTypes.shape({
      value: PropTypes.string.isRequired, // Value of the option
      label: PropTypes.string.isRequired, // Display label of the option
    })
  ).isRequired,
}
export default SortBy;
