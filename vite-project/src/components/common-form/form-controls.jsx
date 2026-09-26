import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

function FormControls({ formControls = [], formData, setFormData }) {
  const [showPasswordMap, setShowPasswordMap] = useState({});

  const togglePasswordVisibility = (fieldName) => {
    setShowPasswordMap((prev) => ({
      ...prev,
      [fieldName]: !prev[fieldName],
    }));
  };

  function renderComponentByType(getControlItem) {
    let element = null;
    const currentControlItemValue = formData[getControlItem.name] || "";
    const isPasswordField =
      getControlItem.type === "password" || getControlItem.name === "password";
    const isShowingPassword = Boolean(showPasswordMap[getControlItem.name]);

    switch (getControlItem.componentType) {
      case "input":
        if (isPasswordField) {
          element = (
            <div className="relative w-full flex items-center" style={{ position: "relative" }}>
              <Input
                id={getControlItem.name}
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                type={isShowingPassword ? "text" : "password"}
                value={currentControlItemValue}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    [getControlItem.name]: event.target.value,
                  })
                }
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(getControlItem.name)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: isShowingPassword ? "#ccff00" : "#888",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
                aria-label={isShowingPassword ? "Hide password" : "Show password"}
                title={isShowingPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                <i className={`fas ${isShowingPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          );
        } else {
          element = (
            <Input
              id={getControlItem.name}
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              type={getControlItem.type}
              value={currentControlItemValue}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: event.target.value,
                })
              }
            />
          );
        }
        break;

      case "select":
        element = (
          <Select
            onValueChange={(value) =>
              setFormData({
                ...formData,
                [getControlItem.name]: value,
              })
            }
            value={currentControlItemValue}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={getControlItem.label} />
            </SelectTrigger>
            <SelectContent>
              {getControlItem.options && getControlItem.options.length > 0
                ? getControlItem.options.map((optionItem) => (
                    <SelectItem key={optionItem.id} value={optionItem.id}>
                      {optionItem.label}
                    </SelectItem>
                  ))
                : null}
            </SelectContent>
          </Select>
        );
        break;

      case "textarea":
        element = (
          <Textarea
            id={getControlItem.name}
            name={getControlItem.name}
            placeholder={getControlItem.placeholder}
            value={currentControlItemValue}
            onChange={(event) =>
              setFormData({
                ...formData,
                [getControlItem.name]: event.target.value,
              })
            }
          />
        );
        break;

      default:
        if (isPasswordField) {
          element = (
            <div className="relative w-full flex items-center" style={{ position: "relative" }}>
              <Input
                id={getControlItem.name}
                name={getControlItem.name}
                placeholder={getControlItem.placeholder}
                type={isShowingPassword ? "text" : "password"}
                value={currentControlItemValue}
                onChange={(event) =>
                  setFormData({
                    ...formData,
                    [getControlItem.name]: event.target.value,
                  })
                }
                style={{ paddingRight: "2.5rem" }}
              />
              <button
                type="button"
                onClick={() => togglePasswordVisibility(getControlItem.name)}
                style={{
                  position: "absolute",
                  right: "0.75rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "transparent",
                  border: "none",
                  color: isShowingPassword ? "#ccff00" : "#888",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 10,
                }}
                aria-label={isShowingPassword ? "Hide password" : "Show password"}
                title={isShowingPassword ? "Hide password" : "Show password"}
                tabIndex="-1"
              >
                <i className={`fas ${isShowingPassword ? "fa-eye-slash" : "fa-eye"}`}></i>
              </button>
            </div>
          );
        } else {
          element = (
            <Input
              id={getControlItem.name}
              name={getControlItem.name}
              placeholder={getControlItem.placeholder}
              type={getControlItem.type}
              value={currentControlItemValue}
              onChange={(event) =>
                setFormData({
                  ...formData,
                  [getControlItem.name]: event.target.value,
                })
              }
            />
          );
        }
        break;
    }

    return element;
  }

  return (
    <div className="flex flex-col gap-3">
      {formControls.map((controleItem) => (
        <div key={controleItem.name}>
          <Label htmlFor={controleItem.name}>{controleItem.label}</Label>
          {renderComponentByType(controleItem)}
        </div>
      ))}
    </div>
  );
}

export default FormControls;