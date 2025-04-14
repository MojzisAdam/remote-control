<?php
namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class HistoryTableResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'cas' => $this->cas,
            'TS1' => $this->TS1,
            'TS2' => $this->TS2,
            'TS3' => $this->TS3,
            'TS4' => $this->TS4,
            'TS5' => $this->TS5,
            'TS6' => $this->TS6,
            'TS7' => $this->TS7,
            'TS8' => $this->TS8,
            'TS9' => $this->TS9,
            'PTO' => $this->PTO,
            'PTUV' => $this->PTUV,
            'PTO2' => $this->PTO2,
            'komp' => $this->komp,
            'kvyk' => $this->kvyk,
            'run' => $this->run,
            'reg' => $this->reg,
            'vjedn' => $this->vjedn,
            'dzto' => $this->dzto,
            'dztuv' => $this->dztuv,
            'tstat' => $this->tstat,
            'hdo' => $this->hdo,
            'obd' => $this->obd,
            'chyba' => $this->chyba,
            'PT' => $this->PT,
            'PPT' => $this->PPT,
            'RPT' => $this->RPT,
            'Prtk' => $this->Prtk,
            'TpnVk' => $this->TpnVk,
        ];
    }
}