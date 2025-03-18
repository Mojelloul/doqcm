import { Button } from "@/components/ui/button";

          <div className="flex justify-between items-center">
            <Button
              type="submit"
              disabled={isSubmitting || !isValid}
              className="flex-1"
            >
              {isSubmitting ? "Envoi en cours..." : "Soumettre"}
            </Button>
            {!isSubmitted && (
              <Button
                type="button"
                variant="outline"
                onClick={handleReset}
                className="ml-4"
              >
                Réessayer
              </Button>
            )}
          </div> 