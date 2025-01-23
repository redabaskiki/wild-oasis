 import PropTypes from "prop-types";

 export const cabinPropTypes = PropTypes.shape({
   id: PropTypes.number.isRequired,
   name: PropTypes.string.isRequired,
   maxCapacity: PropTypes.number.isRequired,
   regularPrice: PropTypes.number.isRequired,
   discount: PropTypes.number,
   image: PropTypes.string.isRequired,
   description: PropTypes.string,
 }).isRequired;


 export const FilterProps = PropTypes.shape({
   filterField: PropTypes.string.isRequired,
 options: PropTypes.shape({
  label: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
 }).isRequired,
 }).isRequired;