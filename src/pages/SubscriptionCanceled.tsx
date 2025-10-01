import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";

const SubscriptionCanceled = () => {
  const navigate = useNavigate();

  return (
    <div className="container mx-auto py-12 px-4 flex items-center justify-center min-h-[80vh]">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <XCircle className="w-10 h-10 text-red-600 dark:text-red-400" />
          </div>
          <CardTitle className="text-2xl">Pagamento Annullato</CardTitle>
          <CardDescription>
            Il processo di pagamento è stato annullato
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground text-center">
            Nessun addebito è stato effettuato. Puoi riprovare quando vuoi.
          </p>
          <div className="flex flex-col gap-2">
            <Button 
              className="w-full" 
              onClick={() => navigate("/subscription")}
            >
              Torna alla pagina abbonamenti
            </Button>
            <Button 
              variant="outline" 
              className="w-full" 
              onClick={() => navigate("/")}
            >
              Torna alla home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubscriptionCanceled;
