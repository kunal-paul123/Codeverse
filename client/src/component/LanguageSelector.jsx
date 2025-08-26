import React from "react";
import { LANGUAGE_VERSIONs } from "../constants";

const languages = Object.entries(LANGUAGE_VERSIONs);

function LanguageSelector({ currentLanguage, onLanguageChange }) {
  return (
    <div className="d-flex align-items-center mb-2">
      <label className="me-2 fw-bold text-light">Language:</label>
      <select
        className="form-select form-select-sm w-auto"
        value={currentLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
      >
        {languages.map(([lang]) => (
          <option key={lang} value={lang}>
            {lang.charAt(0).toUpperCase() + lang.slice(1)}
          </option>
        ))}
      </select>
    </div>
  );
}

export default LanguageSelector;
