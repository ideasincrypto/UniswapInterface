import { providers } from 'ethers'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AccountType } from 'uniswap/src/features/accounts/types'
import { ElementName, ModalName } from 'uniswap/src/features/telemetry/constants'
import { CurrencyField } from 'uniswap/src/features/transactions/transactionState/types'
import { NumberType } from 'utilities/src/format/types'
import { WarningModal } from 'wallet/src/components/modals/WarningModal/WarningModal'
import { useAppFiatCurrencyInfo } from 'wallet/src/features/fiatCurrency/hooks'
import { GasFeeResult } from 'wallet/src/features/gas/types'
import { useLocalizationContext } from 'wallet/src/features/language/LocalizationContext'
import { TransactionDetails } from 'wallet/src/features/transactions/TransactionDetails/TransactionDetails'
import { AddressFooter } from 'wallet/src/features/transactions/TransactionRequest/AddressFooter'
import { TransactionReview } from 'wallet/src/features/transactions/TransactionReview/TransactionReview'
import { WarningSeverity } from 'wallet/src/features/transactions/WarningModal/types'
import { ParsedWarnings } from 'wallet/src/features/transactions/hooks/useParsedTransactionWarnings'
import { useUSDCValue } from 'wallet/src/features/transactions/swap/trade/hooks/useUSDCPrice'
import { DerivedTransferInfo } from 'wallet/src/features/transactions/transfer/types'
import { useActiveAccountAddressWithThrow, useActiveAccountWithThrow } from 'wallet/src/features/wallet/hooks'

interface TransferFormProps {
  derivedTransferInfo: DerivedTransferInfo
  txRequest?: providers.TransactionRequest
  gasFee: GasFeeResult
  onReviewSubmit: () => void
  onPrev: () => void
  warnings: ParsedWarnings
}

export function TransferReview({
  derivedTransferInfo,
  gasFee,
  onReviewSubmit,
  onPrev,
  txRequest,
  warnings,
}: TransferFormProps): JSX.Element | null {
  const { t } = useTranslation()
  const { formatCurrencyAmount, formatNumberOrString } = useLocalizationContext()
  const account = useActiveAccountWithThrow()
  const [showWarningModal, setShowWarningModal] = useState(false)
  const currency = useAppFiatCurrencyInfo()

  const userAddress = useActiveAccountAddressWithThrow()

  const onShowWarning = (): void => {
    setShowWarningModal(true)
  }

  const onCloseWarning = (): void => {
    setShowWarningModal(false)
  }

  const {
    currencyAmounts,
    recipient,
    isFiatInput = false,
    currencyInInfo,
    nftIn,
    chainId,
    exactAmountFiat,
  } = derivedTransferInfo

  const inputCurrencyUSDValue = useUSDCValue(currencyAmounts[CurrencyField.INPUT])

  const { blockingWarning } = warnings

  const actionButtonDisabled =
    !!blockingWarning || !gasFee.value || !!gasFee.error || !txRequest || account.type === AccountType.Readonly

  const actionButtonProps = {
    disabled: actionButtonDisabled,
    label: t('send.button.send'),
    name: ElementName.Send,
    onPress: onReviewSubmit,
  }

  const transferWarning = warnings.warnings.find((warning) => warning.severity >= WarningSeverity.Medium)

  const formattedCurrencyAmount = formatCurrencyAmount({
    value: currencyAmounts[CurrencyField.INPUT],
    type: NumberType.TokenTx,
  })
  const formattedAmountIn = isFiatInput
    ? formatNumberOrString({
        value: exactAmountFiat,
        type: NumberType.FiatTokenQuantity,
        currencyCode: currency.code,
      })
    : formattedCurrencyAmount

  if (!recipient) {
    return null
  }

  return (
    <>
      {showWarningModal && transferWarning?.title && (
        <WarningModal
          caption={transferWarning.message}
          closeText={blockingWarning ? undefined : t('common.button.cancel')}
          confirmText={blockingWarning ? t('common.button.ok') : t('common.button.confirm')}
          modalName={ModalName.SendWarning}
          severity={transferWarning.severity}
          title={transferWarning.title}
          onCancel={onCloseWarning}
          onClose={onCloseWarning}
          onConfirm={onCloseWarning}
        />
      )}
      <TransactionReview
        actionButtonProps={actionButtonProps}
        currencyInInfo={currencyInInfo}
        formattedAmountIn={formattedAmountIn}
        inputCurrencyUSDValue={inputCurrencyUSDValue}
        isFiatInput={isFiatInput}
        nftIn={nftIn}
        recipient={recipient}
        transactionDetails={
          <TransactionDetails
            AccountDetails={<AddressFooter activeAccountAddress={userAddress} />}
            chainId={chainId}
            gasFee={gasFee}
            showWarning={Boolean(transferWarning)}
            warning={transferWarning}
            onShowWarning={onShowWarning}
          />
        }
        usdTokenEquivalentAmount={formattedCurrencyAmount}
        onPrev={onPrev}
      />
    </>
  )
}
