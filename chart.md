

import 'package:http/http.dart' as http;
import 'dart:convert';
class FlexPayService {
final String token =
"Bearer
eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJcL2xvZ2luIiwi
cm9sZXMiOlsiTUVSQ0hBTlQiXSwiZXhwIjoxNzg1NTA5ODMyLCJzdWIiOiI0O
GM2NzEzZWNkMzBmOTc5OGRhMjEzYTZjMWZjOWJiNiJ9.qGnIQKI1S6hlT_jv1
HAB6MXsLcjHnDQfRB0gzYjERHM";
// URL de l'API pour effectuer un paiement
final String paymentUrl =
"https://backend.flexpay.cd/api/rest/v1/
paymentService";
final String cardPaymentUrl = "https://
cardpayment.flexpay.cd/v1.1/pay";
final String checkTransactionUrl =
"https://backend.flexpay.cd/api/rest/v1/check";
// Fonction pour effectuer un paiement
Future<String> makePayment(
String amount,
String number,
String reference,
String description,
) async {
// Données de paiement fournies
Map<String, dynamic> paymentData = {
"merchant": "DevSphire",
"type": "1",
"phone": number,
"reference": reference,
"amount": amount,
"currency": "USD",
"description": description,
"callbackUrl": "https://abcd.efgh.cd",
};
try {
final response = await http.post(
Uri.parse(paymentUrl),
headers: {
'Content-Type': 'application/json',
'Authorization': token,
},
body: jsonEncode(paymentData),
);
if (response.statusCode == 200) {
print("Payment successful: ${response.body}");
Map<String, dynamic> decodedResponse =
jsonDecode(response.body);
String orderNumber = decodedResponse['orderNumber'];
return orderNumber;
} else {
// Erreur lors du paiement
print("Payment failed: ${response.statusCode} - $
{response.body}");
Map<String, dynamic> decodedResponse =
jsonDecode(response.body);
String orderNumber = decodedResponse['orderNumber'];
return orderNumber;
}
} catch (e) {
print("Error making payment: $e");
return '';
}
}
// Fonction pour effectuer un paiement par carte bancaire
Future<String> makeCardPayment(
String amount,
String reference,
String description,
) async {
Map<String, dynamic> cardPaymentData = {
"authorization": token,
"merchant": "DevSphire",
"reference": reference,
"amount": amount,
"currency": "USD",
"description": description,
"callback_url": "https://xxxxxx/callback.com",
"approve_url": "https://xxxxxx/approve.com",
"cancel_url": "https://xxxxxxxx/cancel.com",
"decline_url": "https://xxxxxxxx/decline.com"
};
try {
final response = await http.post(
Uri.parse(cardPaymentUrl),
headers: {
'Content-Type': 'application/json',
'Authorization': cardPaymentData['authorization'],
},
body: jsonEncode(cardPaymentData),
);
if (response.statusCode == 200) {
print("Card payment successful: ${response.body}");
// Décoder la réponse JSON
Map<String, dynamic> decodedResponse =
jsonDecode(response.body);
String url = decodedResponse['url'];
return url;
} else {
print("Card payment failed: ${response.statusCode} -
${response.body}");
return '';
}
} catch (e) {
print("Error making card payment: $e");
return '';
}
}
// Fonction pour vérifier une transaction
Future<String> checkTransaction(String orderNumber) async {
try {
final response = await http.get(
Uri.parse("$checkTransactionUrl/$orderNumber"),
headers: {
'Authorization': token,
},
);
if (response.statusCode == 200) {
// Transaction vérifiée avec succès
print("Transaction successful: ${response.body}");
Map<String, dynamic> decodedResponse =
jsonDecode(response.body);
String message = decodedResponse['message'];
return message;
} else {
// Erreur lors de la vérification de la transaction
print(
"Transaction check failed: ${response.statusCode}
- ${response.body}");
Map<String, dynamic> decodedResponse =
jsonDecode(response.body);
String message = decodedResponse['message'];
return message;
}
} catch (e) {
print("Error checking transaction: $e");
return '';
}
}
}