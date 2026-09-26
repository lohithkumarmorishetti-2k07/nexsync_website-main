import React from "react";
import { Button } from "@/components/ui/button";
import FormControls from "./form-controls";

function CommonForm({
  handleSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    console.log("Form submitted - no handler provided");
  },
  buttonText,
  formControls = [],
  formData,
  setFormData,
  isButtonDisabled = false,
}) {
  const onFormSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (isButtonDisabled) return;
    handleSubmit(e);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (!isButtonDisabled) {
        onFormSubmit(e);
      }
    }
  };

  return (
    <form onSubmit={onFormSubmit} onKeyDown={handleKeyDown} noValidate>
      {/* render form controls here */}
      <FormControls
        formControls={formControls}
        formData={formData}
        setFormData={setFormData}
      />
      <Button disabled={isButtonDisabled} type="submit" className="mt-5 w-full">
        {buttonText || "Submit"}
      </Button>
    </form>
  );
}

export default CommonForm;