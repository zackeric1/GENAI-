import {
  BreadcrumbGroup,
  Header,
  Pagination,
  PropertyFilter,
  Table,
} from "@cloudscape-design/components";
import useOnFollow from "../../../common/hooks/use-on-follow";
import BaseAppLayout from "../../../components/base-app-layout";
import { useContext, useState, useCallback, useEffect } from "react";
import { useCollection } from "@cloudscape-design/collection-hooks";
import { ApiClient } from "../../../common/api-client/api-client";
import { AppContext } from "../../../common/app-context";
import { TextHelper } from "../../../common/helpers/text-helper";
import { PropertyFilterI18nStrings } from "../../../common/i18n/property-filter-i18n-strings";
import { LLMItem, ResultValue } from "../../../common/types";
import { TableEmptyState } from "../../../components/table-empty-state";
import { TableNoMatchState } from "../../../components/table-no-match-state";
import {
  ModelsColumnDefinitions,
  ModelsColumnFilteringProperties,
} from "./column-definitions";

export default function Models() {
  const onFollow = useOnFollow();
  const appContext = useContext(AppContext);
  const [models, setModels] = useState<LLMItem[]>([]);
  const [loading, setLoading] = useState(true);
  const {
    items,
    actions,
    filteredItemsCount,
    collectionProps,
    paginationProps,
    propertyFilterProps,
  } = useCollection(models, {
    propertyFiltering: {
      filteringProperties: ModelsColumnFilteringProperties,
      empty: <TableEmptyState resourceName="LLM" />,
      noMatch: (
        <TableNoMatchState
          onClearFilter={() => {
            actions.setPropertyFiltering({ tokens: [], operation: "and" });
          }}
        />
      ),
    },
    pagination: { pageSize: 50 },
    sorting: {
      defaultState: {
        sortingColumn: ModelsColumnDefinitions[0],
        isDescending: true,
      },
    },
    selection: {},
  });

  const getModels = useCallback(async () => {
    if (!appContext) return;

    const apiClient = new ApiClient(appContext);
    const result = await apiClient.llms.getModels();
    if (ResultValue.ok(result)) {
      setModels(result.data);
    }

    setLoading(false);
  }, [appContext]);

  useEffect(() => {
    if (!appContext) return;

    getModels();
  }, [appContext, getModels]);

  return (
    <BaseAppLayout
      contentType="table"
      breadcrumbs={
        <BreadcrumbGroup
          onFollow={onFollow}
          items={[
            {
              text: "AWS GenAI Chatbot",
              href: "/",
            },
            {
              text: "Large Language Models (LLMs)",
              href: "/chatbot/models",
            },
          ]}
        />
      }
      content={
        <Table
          {...collectionProps}
          items={items}
          columnDefinitions={ModelsColumnDefinitions}
          variant="full-page"
          stickyHeader={true}
          resizableColumns={true}
          header={
            <Header variant="awsui-h1-sticky">
              Large Language Models (LLMs)
            </Header>
          }
          loading={loading}
          loadingText="Loading Large Language Models (LLMs)"
          filter={
            <PropertyFilter
              {...propertyFilterProps}
              i18nStrings={PropertyFilterI18nStrings}
              filteringPlaceholder={"Filter Large Language Models (LLMs)"}
              countText={TextHelper.getTextFilterCounterText(
                filteredItemsCount
              )}
              expandToViewport={true}
            />
          }
          pagination={<Pagination {...paginationProps} />}
        />
      }
    />
  );
}
