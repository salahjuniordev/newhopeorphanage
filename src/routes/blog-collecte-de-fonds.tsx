import { createFileRoute } from "@tanstack/react-router";
import { BlogPostPage } from "@/components/BlogPostPage";

export const Route = createFileRoute("/blog-collecte-de-fonds")({
  component: BlogCollecteDeFonds,
});

function BlogCollecteDeFonds() {
  return (
    <BlogPostPage
      categoryFr="Collecte de fonds"
      categoryEn="Fundraising"
      titleFr="Unir nos forces pour soutenir les enfants"
      titleEn="Uniting our forces to support children"
      heroImage="/legacy/images/blog-fundraising.jpg"
      heroAltFr="Événement de collecte de fonds pour les enfants"
      heroAltEn="Fundraising event for children"
      publishDate="21 août 2026 / August 21, 2026"
    >
      <div>
        {/* French Content */}
        <div data-lang="fr">
          <p>
            Soutenir les enfants demande un engagement qui va au-delà d'un simple
            geste ponctuel. Les besoins sont nombreux et la continuité du soutien est
            essentielle pour permettre à une organisation comme New Hope Orphanage de
            poursuivre sa mission.
          </p>

          <p>
            Les événements de collecte de fonds constituent une manière concrète de
            rassembler une communauté autour d'une cause commune : contribuer au
            bien-être et à l'avenir des enfants.
          </p>

          <h2>Une collecte de fonds est bien plus qu'un événement</h2>

          <p>
            Une collecte de fonds permet bien sûr de réunir des ressources, mais elle
            permet également de créer des liens.
          </p>

          <p>
            Elle rassemble des personnes qui partagent les mêmes valeurs :
            particuliers, familles, entreprises, associations, bénévoles et
            partenaires.
          </p>

          <p>
            Chaque participant devient ainsi une partie d'un effort collectif visant à
            soutenir les enfants et à créer de nouvelles opportunités pour eux.
          </p>

          <h2>À quoi servent les fonds collectés ?</h2>

          <p>
            Les besoins d'une organisation qui accompagne des enfants sont variés.
          </p>

          <p>
            Selon les priorités du moment, les ressources peuvent contribuer à soutenir
            l'éducation, les fournitures scolaires, les besoins quotidiens, les
            activités éducatives et récréatives ou différents projets destinés au
            bien-être des enfants.
          </p>

          <p>
            L'utilisation des ressources doit toujours être guidée par les besoins
            réels et les priorités de la mission.
          </p>

          <h2>Créer une communauté autour de la cause</h2>

          <p>
            Un événement de collecte peut prendre de nombreuses formes.
          </p>

          <p>
            Il peut s'agir d'une rencontre communautaire, d'une activité organisée
            par une entreprise, d'une initiative menée par des bénévoles, d'une
            campagne en ligne ou d'un événement réunissant différents partenaires.
          </p>

          <p>
            L'important n'est pas nécessairement la taille de l'événement. Ce qui
            compte, c'est la mobilisation des personnes autour d'un objectif commun.
          </p>

          <h2>Les entreprises peuvent jouer un rôle important</h2>

          <p>
            Les entreprises du Cameroun, notamment à Yaoundé et à Douala, peuvent
            contribuer de différentes manières à la mission de New Hope Orphanage.
          </p>

          <p>
            Une entreprise peut organiser une collecte interne, soutenir un événement,
            mobiliser ses employés, apporter des ressources ou établir un partenariat
            sur le long terme.
          </p>

          <p>
            Ces initiatives peuvent également permettre aux entreprises de renforcer
            leur engagement social au sein de leur communauté.
          </p>

          <h2>Les particuliers peuvent également contribuer</h2>

          <p>
            Il n'est pas nécessaire d'organiser un grand événement pour avoir un
            impact.
          </p>

          <p>
            Une personne peut participer à une collecte, faire un don, mobiliser son
            entourage ou simplement partager l'information avec son réseau.
          </p>

          <p>
            Lorsque plusieurs personnes font un petit geste, l'effet collectif peut
            devenir significatif.
          </p>

          <h2>Sensibiliser tout en collectant</h2>

          <p>
            Les événements de collecte sont également importants pour sensibiliser
            davantage le public aux réalités auxquelles sont confrontés certains
            enfants.
          </p>

          <p>
            Parler de la mission de l'organisation, expliquer les besoins et montrer
            les différentes manières de contribuer permet de créer une communauté de
            soutien mieux informée.
          </p>

          <p>
            Cette sensibilisation peut également encourager d'autres personnes à
            s'engager à leur tour.
          </p>

          <h2>Une mobilisation qui continue après l'événement</h2>

          <p>
            Une collecte de fonds ne devrait pas nécessairement être considérée comme
            une action unique.
          </p>

          <p>
            Les relations créées pendant un événement peuvent devenir des partenariats
            durables. Un participant peut devenir bénévole, un donateur peut continuer
            à soutenir l'organisation ou une entreprise peut développer une
            collaboration à long terme.
          </p>

          <p>
            C'est ainsi qu'une initiative ponctuelle peut progressivement devenir une
            relation durable.
          </p>

          <h2>Comment participer ou organiser une collecte ?</h2>

          <p>
            Les personnes, associations, entreprises et groupes communautaires qui
            souhaitent organiser une collecte de fonds ou contribuer à une initiative
            de soutien peuvent contacter New Hope Orphanage afin d'échanger sur les
            possibilités.
          </p>

          <p>
            Chaque proposition peut être étudiée en fonction des besoins et des
            objectifs de l'organisation.
          </p>

          <h2>Ensemble, nous pouvons faire davantage</h2>

          <p>
            Lorsqu'une communauté se mobilise autour des enfants, elle crée davantage
            de possibilités.
          </p>

          <p>
            Un événement peut représenter une journée, quelques heures ou une campagne
            de plusieurs semaines. Mais son impact peut continuer bien au-delà de sa
            durée.
          </p>

          <p>
            À New Hope Orphanage, nous croyons que chaque geste de solidarité compte
            et que l'engagement collectif peut contribuer à construire un avenir plus
            prometteur pour les enfants au Cameroun.
          </p>
        </div>

        {/* English Content */}
        <div data-lang="en">
          <p>
            Supporting children requires a commitment that goes beyond a single
            gesture. The needs are many, and the continuity of support is essential to
            allow an organization like New Hope Orphanage to continue its mission.
          </p>

          <p>
            Fundraising events are a concrete way to bring a community together around
            a common cause: contributing to the well-being and future of children.
          </p>

          <h2>A fundraiser is much more than an event</h2>

          <p>
            A fundraiser certainly brings together resources, but it also creates
            connections.
          </p>

          <p>
            It brings together people who share the same values: individuals,
            families, businesses, associations, volunteers, and partners.
          </p>

          <p>
            Each participant becomes part of a collective effort to support children
            and create new opportunities for them.
          </p>

          <h2>What are the collected funds used for?</h2>

          <p>
            The needs of an organization that supports children are varied.
          </p>

          <p>
            Depending on current priorities, resources can help support education,
            school supplies, daily needs, educational and recreational activities, or
            various projects aimed at children's well-being.
          </p>

          <p>
            The use of resources must always be guided by real needs and the
            priorities of the mission.
          </p>

          <h2>Creating a community around the cause</h2>

          <p>
            A fundraising event can take many forms.
          </p>

          <p>
            It can be a community gathering, an activity organized by a business, an
            initiative led by volunteers, an online campaign, or an event bringing
            together various partners.
          </p>

          <p>
            The importance is not necessarily the size of the event. What matters is
            the mobilization of people around a common goal.
          </p>

          <h2>Businesses can play an important role</h2>

          <p>
            Businesses in Cameroon, particularly in Yaoundé and Douala, can contribute
            in various ways to New Hope Orphanage's mission.
          </p>

          <p>
            A business can organize an internal fundraiser, support an event, mobilize
            its employees, provide resources, or establish a long-term partnership.
          </p>

          <p>
            These initiatives can also allow businesses to strengthen their social
            commitment within their community.
          </p>

          <h2>Individuals can also contribute</h2>

          <p>
            It is not necessary to organize a large event to have an impact.
          </p>

          <p>
            A person can participate in a fundraiser, make a donation, mobilize their
            network, or simply share information with their contacts.
          </p>

          <p>
            When several people make a small gesture, the collective effect can become
            significant.
          </p>

          <h2>Raising awareness while collecting</h2>

          <p>
            Fundraising events are also important for raising public awareness about
            the realities that some children face.
          </p>

          <p>
            Talking about the organization's mission, explaining the needs, and
            showing the different ways to contribute helps create a better-informed
            support community.
          </p>

          <p>
            This awareness can also encourage other people to get involved.
          </p>

          <h2>Mobilization that continues after the event</h2>

          <p>
            A fundraiser should not necessarily be considered a one-time action.
          </p>

          <p>
            The relationships created during an event can become lasting
            partnerships. A participant can become a volunteer, a donor can continue
            to support the organization, or a business can develop a long-term
            collaboration.
          </p>

          <p>
            This is how a one-time initiative can gradually become a lasting
            relationship.
          </p>

          <h2>How to participate or organize a fundraiser?</h2>

          <p>
            Individuals, associations, businesses, and community groups that wish to
            organize a fundraiser or contribute to a support initiative can contact
            New Hope Orphanage to discuss possibilities.
          </p>

          <p>
            Each proposal can be studied according to the organization's needs and
            objectives.
          </p>

          <h2>Together, we can do more</h2>

          <p>
            When a community mobilizes around children, it creates more
            possibilities.
          </p>

          <p>
            An event can represent a day, a few hours, or a campaign lasting several
            weeks. But its impact can continue well beyond its duration.
          </p>

          <p>
            At New Hope Orphanage, we believe that every act of solidarity counts and
            that collective commitment can help build a more promising future for
            children in Cameroon.
          </p>
        </div>
      </div>
    </BlogPostPage>
  );
}
