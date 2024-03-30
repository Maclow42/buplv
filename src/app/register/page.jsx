"use client";

import { useRef, useState } from "react";
import registerAction from "./registerAction";

import "../globals.css";
import "./styles.css";
import PasswordStrengthMeter from "../components/PasswordStrengthMeter/PasswordStrengthMeter";
import ReturnMenuButton from "../components/Button/ReturnMenuButton/returnMenuButton";
import isValidPhoneNumber from "../helpers/validatePhoneNumber";
import validateIBANAndBIC from "../helpers/areIBANandBICcorrects";
import areIBANandBICcorrects from "../helpers/areIBANandBICcorrects";

export default function register() {
  const formRef = useRef(null);
  const [step, setStep] = useState(1);

  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    student_name: "",
    student_firstname: "",
    grade: "",
    email: "",
    phone: "",
    password: "",
    password2: "",
    address: "",
    comp_address: "",
    zip: "",
    city: "",
    iban: "",
    bic: "",
  });

  function formatPhoneNumber(phoneNumber) {
    // Supprime tous les caractères non numériques du numéro de téléphone
    const cleanedPhoneNumber = phoneNumber.replace(/\D/g, "");

    // Ajoute '+33' au début du numéro de téléphone
    let formattedPhoneNumber = "+33";

    // Ajoute le premier chiffre après '+33' séparément
    formattedPhoneNumber += ` ${cleanedPhoneNumber.substr(2, 1)}`;

    // Parcourt chaque paire de chiffres restante du numéro de téléphone et les sépare par des '.'
    for (let i = 3; i < cleanedPhoneNumber.length; i += 2) {
      formattedPhoneNumber += ` ${cleanedPhoneNumber.substr(i, 2)}`;
    }

    return formattedPhoneNumber;
  }

  const handleChange = (e) => {
    let { name, value } = e.target;
    if (name === "email") value = value.toLowerCase().replace(/\s/g, "");
    if (name === "phone") value = formatPhoneNumber(value);
    setFormData({ ...formData, [name]: value });

    if (step === 1) {
      formRef.current
        .querySelector('input[name="password"]')
        .setCustomValidity("");
      formRef.current
        .querySelector('input[name="password2"]')
        .setCustomValidity("");
      formRef.current
        .querySelector('input[name="phone"]')
        .setCustomValidity("");
    } else if (step === 3) {
      formRef.current.querySelector('input[name="iban"]').setCustomValidity("");
      formRef.current.querySelector('input[name="bic"]').setCustomValidity("");
    }

    setError("");
  };

  const handleStepChange = (value, verify = true) => {
    if (!verify) return setStep(value);

    if (step == 2) {
      if (formRef.current.checkValidity()) {
        setStep(value);
      } else {
        formRef.current.reportValidity();
      }
      return;
    }

    const passwordInput = formRef.current.querySelector(
      'input[name="password"]'
    );
    const password2Input = formRef.current.querySelector(
      'input[name="password2"]'
    );

    const passwordStrengthComponent = formRef.current.querySelector(
      ".password-strength-meter .progress"
    );
    const passwordStrength = parseInt(passwordStrengthComponent.value);

    const phoneNumber = formRef.current.querySelector('input[name="phone"]');

    passwordInput.setCustomValidity("");
    password2Input.setCustomValidity("");
    phoneNumber.setCustomValidity("");

    if (passwordStrength <= 50) {
      passwordInput.setCustomValidity("Votre mot de passe est trop faible.");
      passwordInput.reportValidity();
    } else if (passwordInput.value !== password2Input.value) {
      password2Input.setCustomValidity(
        "Les mots de passe ne correspondent pas."
      );
      password2Input.reportValidity();
    } else if (isValidPhoneNumber(phoneNumber.value) === false) {
      phoneNumber.setCustomValidity("Numéro de téléphone invalide.");
      phoneNumber.reportValidity();
    } else if (!formRef.current.checkValidity()) {
      formRef.current.reportValidity();
    } else {
      setStep(value);
    }

    return;
  };

  const handleValidateForm = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const ibanInput = formRef.current.querySelector('input[name="iban"]');
    const bicInput = formRef.current.querySelector('input[name="bic"]');
    ibanInput.setCustomValidity("");
    bicInput.setCustomValidity("");

    const { validIban, validBic } = await areIBANandBICcorrects({
      iban: formData.iban,
      bic: formData.bic,
    });
    if (!validIban) {
      ibanInput.setCustomValidity("IBAN invalide.");
      ibanInput.reportValidity();
      setIsLoading(false);
      return;
    } else if (!validBic) {
      bicInput.setCustomValidity("BIC invalide.");
      bicInput.reportValidity();
      setIsLoading(false);
      return;
    }

    const address =
      formData.address +
      ", " +
      (formData.comp_address ? formData.comp_address + ", " : "") +
      formData.zip +
      formData.city;

    const processedData = {
      student_firstname: formData.student_firstname,
      student_name: formData.student_name,
      grade: formData.grade,
      email: formData.email,
      phone: formData.phone,
      password: formData.password,
      address: address,
      iban: formData.iban,
      bic: formData.bic,
    };
    const apiResult = await registerAction(processedData);
    if (apiResult) {
      setError(apiResult);
      setIsLoading(false);
    }
  };

  return (
    <div className="mainContainer" id="registerMainContainer">
      <div className="formContainer">
        <h1 className="formTitle">Créer un compte</h1>

        <span id="circleSpan">
          <p className={"circle " + (step >= 1 ? "active" : "")}>1</p>
          <div className={"line " + (step >= 2 ? "active" : "")}></div>
          <p className={"circle " + (step >= 2 ? "active" : "")}>2</p>
          <div className={"line " + (step >= 3 ? "active" : "")}></div>
          <p className={"circle " + (step >= 3 ? "active" : "")}>3</p>
        </span>

        <form
          ref={formRef}
          onSubmit={handleValidateForm}
          className="formulaire"
        >
          {step === 1 && (
            <>
              <span>
                <label>
                  Prénom:
                  <input
                    type="text"
                    name="student_firstname"
                    value={formData.student_firstname}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Nom:
                  <input
                    type="text"
                    name="student_name"
                    value={formData.student_name}
                    onChange={handleChange}
                    required
                  />
                </label>
              </span>

              <label>
                Classe de l'élève:
                <input
                  type="text"
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Email:
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                N° de téléphone:
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                />
              </label>

              <label>
                Mot de passe:
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </label>
              <PasswordStrengthMeter password={formData.password} />
              <label>
                Vérification du mot de passe:
                <input
                  type="password"
                  name="password2"
                  value={formData.password2}
                  onChange={handleChange}
                  required
                />
              </label>

              <button onClick={() => handleStepChange(2)}>Suivant</button>
            </>
          )}
          {step === 2 && (
            <>
              <label>
                N° et nom de la rue:
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Complément d'adresse:
                <input
                  type="text"
                  name="comp_address"
                  value={formData.comp_address}
                  onChange={handleChange}
                />
              </label>
              <span>
                <label>
                  Code postal:
                  <input
                    type="text"
                    name="zip"
                    value={formData.zip}
                    onChange={handleChange}
                    required
                  />
                </label>
                <label>
                  Ville:
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                  />
                </label>
              </span>

              <span className="buttonSpan">
                <button onClick={() => handleStepChange(1, false)}>
                  Précédent
                </button>
                <button onClick={() => handleStepChange(3)}>Suivant</button>
              </span>
            </>
          )}
          {step === 3 && (
            <>
              <label>
                IBAN:
                <input
                  type="text"
                  name="iban"
                  value={formData.iban}
                  onChange={handleChange}
                  required
                />
              </label>
              <label>
                Bic:
                <input
                  type="text"
                  name="bic"
                  value={formData.bic}
                  onChange={handleChange}
                  required
                />
              </label>

              <span className="buttonSpan">
                <button
                  onClick={() => handleStepChange(2, false)}
                  disabled={isLoading}
                >
                  Précédent
                </button>
                <button type="submit" disabled={isLoading}>
                  {!isLoading ? "Valider" : "Chargement..."}
                </button>
              </span>
            </>
          )}
        </form>
        <p className="errorMessage">{error}</p>
        <p id="loginLink">
          Déjà inscrit ? <a href="/login">Je me connecte</a>
        </p>
      </div>
      <ReturnMenuButton />
    </div>
  );
}
