import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

function MotorAccordion({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Accordion
      type="multiple"
      className="w-full !rounded-lg border border-borderLightColor ring-0"
      defaultValue={[]}
    >
      <AccordionItem value="item-1" className="w-full">
        <AccordionTrigger className="bg-accordionColor hover:bg-accordionColor/80 text-textDarkColor !rounded-none font-semibold pl-10 focus:ring-0 ring-0">
          {title}
        </AccordionTrigger>
        <AccordionContent className="w-full border-none rounded-b-lg !bg-transparent">
          {children}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

export default MotorAccordion;
