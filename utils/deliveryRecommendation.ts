import { DeliveryPerson } from "@/component/DeliveryPersonCard";

/**
 * Get top 3 delivery persons by totalDeliveries count
 * Only includes available persons
 */
export const getRecommendedDeliveryPersons = (
  deliveryPersons: DeliveryPerson[]
): DeliveryPerson[] => {
  return deliveryPersons
    .filter((person) => person.isAvailable) // Only available
    .sort((a, b) => b.totalDeliveries - a.totalDeliveries) // Sort by highest deliveries
    .slice(0, 3); // Get top 3
};

/**
 * Check if a person is in the recommended list
 */
export const isDeliveryPersonRecommended = (
  deliveryPerson: DeliveryPerson,
  recommendedList: DeliveryPerson[]
): boolean => {
  return recommendedList.some((person) => person.id === deliveryPerson.id);
};