/* eslint-disable prettier/prettier */
import React, { useState } from "react"
import type { BlockComponent } from "vtex.render-runtime"
import axios from "axios"
import styles from './styles.css'

const BlackFridayForm: BlockComponent = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    tel: "",
    category: [] as string[],
  })

  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(false)

  const categoriesList = [
    "Feminino",
    "Masculino",
    "Bolsas",
    "Camisetas",
    "Vestidos",
    "Jeans",
    "Polos",
    "Acessórios",
  ]

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleCategoryClick = (category: string) => {
    setFormData((prev) => {
      const exists = prev.category.includes(category)
      return {
        ...prev,
        category: exists
          ? prev.category.filter((c) => c !== category)
          : [...prev.category, category],
      }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      await axios.post("/api/dataentities/BF/documents", {
        name: formData.name,
        email: formData.email,
        tel: formData.tel,
        category: formData.category.join(", "),
      })
      setSuccess(true)
      setError(false)
      setFormData({ name: "", email: "", tel: "", category: [] })
    } catch (err) {
      setError(true)
      setSuccess(false)
    }
  }

  return (
    <div className={styles.containerFormBF}>
      <form
        className={styles.containerForm}
        onSubmit={handleSubmit}
      >
        <p className={styles.containerFormTitle}>
          Cadastre-se para receber ofertas e benefícios exclusivos antes de todo<br/>mundo na Black Friday GUESS.
        </p>

        <div className={styles.containerFormInput}>
          <input
            type="text"
            name="name"
            placeholder="*Nome"
            value={formData.name}
            onChange={handleChange}
            required
            className={styles.InputName}
          />
          <input
            type="email"
            name="email"
            placeholder="*E-mail"
            value={formData.email}
            onChange={handleChange}
            required
            className={styles.InputEmail}
          />
          <input
            type="tel"
            name="tel"
            placeholder="*(DDD) 99999-9999"
            value={formData.tel}
            onChange={handleChange}
            required
            className={styles.InputTel}
          />
        </div>

        <p className={styles.categoriesTitle}>Quais categorias você deseja receber ofertas?</p>

        <div className={styles.categoriesOptions}>
          {categoriesList.map((category) => (
            <button
              type="button"
              key={category}
              onClick={() => handleCategoryClick(category)}
              className={`${
                formData.category.includes(category)
                  ? styles.inputSelected
                  : styles.input
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        <p className={styles.acceptTerms}>
          *Ao clicar em ENVIAR, declaro que li e concordo com<br/>as Políticas de
          Privacidade e os Termos e condições de uso.
        </p>

        <button
          type="submit"
          className={styles.buttonSend}
        >
          ENVIAR
        </button>

        {success && (
          <p className={styles.buttonSucess}>Cadastro realizado com sucesso!</p>
        )}
        {error && (
          <p className={styles.buttonFail}>
            Ocorreu um erro. Tente novamente mais tarde.
          </p>
        )}
      </form>
    </div>
  )
}

BlackFridayForm.schema = {
  title: "Formulário Black Friday",
  description: "Formulário de cadastro para a Black Friday",
  type: "object",
  properties: {},
}

export default BlackFridayForm
